import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api-utils";
import { slugify } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    // Fetch current product so we only change slug when name actually changes
    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) return apiError("Product not found", 404);

    const updateData: Prisma.ProductUpdateInput = {
      name: body.name,
      description: body.description,
      brand: body.brand?.trim() || null,
      color: body.color?.trim() || null,
      wholesalePrice: body.wholesalePrice === "" || body.wholesalePrice === null || body.wholesalePrice === undefined ? null : body.wholesalePrice,
      wholesaleMinQty: Number(body.wholesaleMinQty || 10),
      price: body.price,
      compareAt: body.compareAt,
      images: JSON.stringify(body.images),
      featured: body.featured ?? false,
      isNew: body.isNew ?? false,
      isBestSeller: body.isBestSeller ?? false,
      category: {
        connect: { id: body.categoryId },
      },
      sizes: {
        deleteMany: {},
        create: body.sizes as Prisma.ProductSizeCreateWithoutProductInput[],
      },
    };

    // Only regenerate slug if the name actually changed
    if (body.name && body.name !== currentProduct.name) {
      let newSlug = slugify(body.name);

      // Ensure slug is unique excluding the current product
      const existing = await prisma.product.findFirst({
        where: {
          slug: newSlug,
          NOT: { id },
        },
      });

      if (existing) {
        newSlug = `${newSlug}-${Date.now()}`;
      }

      updateData.slug = newSlug;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { sizes: true, category: true },
    });

    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return apiSuccess(product);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return apiError("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return apiError("Forbidden", 403);
    }
    return apiError("Failed to update product", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    await prisma.$transaction([
      prisma.productSize.deleteMany({ where: { productId: id } }),
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return apiSuccess({ success: true, deleted: product });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return apiError("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return apiError("Forbidden", 403);
    }
    return apiError("Failed to delete product", 500);
  }
}
