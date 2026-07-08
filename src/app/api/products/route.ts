import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, requireAdmin } from "@/lib/api-utils";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { sizes: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(products);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const slug = slugify(body.name);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        compareAt: body.compareAt,
        images: JSON.stringify(body.images),
        featured: body.featured ?? false,
        isNew: body.isNew ?? false,
        isBestSeller: body.isBestSeller ?? false,
        categoryId: body.categoryId,
        sizes: {
          create: body.sizes,
        },
      },
      include: { sizes: true, category: true },
    });

    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");

    return apiSuccess(product, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return apiError("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return apiError("Forbidden", 403);
    }
    return apiError("Failed to create product", 500);
  }
}
