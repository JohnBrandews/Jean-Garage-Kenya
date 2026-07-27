import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { sizes: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-charcoal">Edit Product</h1>
      <p className="mt-1 text-gray-500">Update product details and inventory.</p>

      <div className="mt-8 flex items-center gap-3">
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>

      <div className="mt-8">
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            compareAt: product.compareAt ? product.compareAt.toString() : null,
            categoryId: product.categoryId,
            images: product.images,
            brand: product.brand,
            color: product.color,
            wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toString() : null,
            wholesaleMinQty: product.wholesaleMinQty,
            featured: product.featured,
            isNew: product.isNew,
            isBestSeller: product.isBestSeller,
            sizes: product.sizes.map((size) => ({ size: size.size, stock: size.stock })),
          }}
        />
      </div>
    </div>
  );
}
