import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = { title: "Manage Categories" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Categories</h1>
          <p className="mt-1 text-gray-500">{categories.length} categories</p>
        </div>
        <Link href="/admin/categories/new">
          <Button variant="primary"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-border bg-white overflow-hidden">
            <div className="relative aspect-video bg-light-gray">
              {cat.imageUrl && (
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
              )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-bold">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat._count.products} products</p>
                <div className="mt-3 flex items-center gap-4">
                  <Link href={`/admin/categories/${cat.id}`} className="text-sm text-gold hover:underline">
                    View / Edit
                  </Link>
                  <Link href={`/admin/products/new?categoryId=${cat.id}`} className="text-sm text-gold hover:underline">
                    Add Product
                  </Link>
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}
