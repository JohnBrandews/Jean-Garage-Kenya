import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
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

    const updateData: any = {
      name: body.name,
      description: body.description,
      price: body.price,
      compareAt: body.compareAt,
      images: JSON.stringify(body.images),
      featured: body.featured ?? false,
      isNew: body.isNew ?? false,
      isBestSeller: body.isBestSeller ?? false,
      categoryId: body.categoryId,
      sizes: {
        deleteMany: {},
        create: body.sizes,
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
