import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-charcoal">Add Product</h1>
      <p className="mt-1 text-gray-500">Upload a new product to the store collection.</p>

      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
