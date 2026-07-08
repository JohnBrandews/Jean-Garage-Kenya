import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseImages } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Edit Category" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        include: { sizes: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-label mb-3">Category</p>
          <h1 className="font-display text-3xl font-bold text-charcoal">{category.name}</h1>
          <p className="mt-2 text-sm text-charcoal/55">{category.products.length} products in this category</p>
        </div>
        <Link href={`/admin/products/new?categoryId=${category.id}`}>
          <Button variant="primary">Add Product in Category</Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="editorial-panel overflow-hidden bg-white">
            <div className="relative aspect-video bg-light-gray">
              {category.imageUrl ? (
                <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-charcoal/45">No image set</div>
              )}
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-charcoal/45">Category details</p>
              <p className="mt-2 text-sm text-charcoal/60">Slug: {category.slug}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-display text-2xl font-bold text-charcoal">Edit Category</h2>
            <CategoryForm category={category} />
          </div>
        </div>

        <div className="editorial-panel overflow-hidden">
          <div className="border-b border-black/5 px-6 py-5">
            <h2 className="font-display text-2xl font-bold text-charcoal">Products in this Category</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-black/5 bg-white/60 text-xs uppercase tracking-[0.2em] text-charcoal/45">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {category.products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-sm text-charcoal/55">
                      No products yet. Add one to start building this collection.
                    </td>
                  </tr>
                ) : (
                  category.products.map((product) => {
                    const totalStock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
                    return (
                      <tr key={product.id} className="text-sm">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-10 overflow-hidden bg-light-gray">
                              <Image
                                src={parseImages(product.images)[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-charcoal">{product.name}</p>
                              <p className="text-xs text-charcoal/45">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-semibold text-charcoal">{formatPrice(Number(product.price))}</td>
                        <td className="px-6 py-5 text-charcoal/70">{totalStock}</td>
                        <td className="px-6 py-5">
                          <Link href={`/admin/products/${product.id}`} className="text-gold hover:underline">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
