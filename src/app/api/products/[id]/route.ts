import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api-utils";
import { slugify } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: slugify(body.name),
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
      },
      include: { sizes: true, category: true },
    });

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
