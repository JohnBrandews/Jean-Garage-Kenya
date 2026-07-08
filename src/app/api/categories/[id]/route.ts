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
    const name = String(body.name || "").trim();

    if (!name) {
      return apiError("Category name is required", 400);
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slugify(name),
        imageUrl: body.imageUrl || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    revalidatePath("/products");
    revalidatePath("/");

    return apiSuccess(category);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return apiError("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return apiError("Forbidden", 403);
    }
    return apiError("Failed to update category", 500);
  }
}
