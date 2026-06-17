import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseImages, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import Image from "next/image";

export const metadata = { title: "Manage Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, sizes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Products</h1>
          <p className="mt-1 text-gray-500">{products.length} products</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="mt-8 border border-border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-light-gray">
            <tr>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Product</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Price</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Stock</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
              return (
                <tr key={product.id} className="border-b border-border hover:bg-light-gray/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 overflow-hidden bg-light-gray">
                        <Image
                          src={parseImages(product.images)[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-semibold">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.category.name}</td>
                  <td className="px-6 py-4 font-bold">{formatPrice(Number(product.price))}</td>
                  <td className="px-6 py-4">
                    <span className={totalStock === 0 ? "rounded-full bg-red-100 px-3 py-1 font-bold text-red-700" : totalStock <= 5 ? "font-bold text-red-600" : ""}>
                      {totalStock === 0 ? "Out of Stock" : totalStock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/products/${product.id}`} className="text-gold hover:underline">
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
