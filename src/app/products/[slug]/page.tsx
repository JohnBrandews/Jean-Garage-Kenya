import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { parseImages } from "@/lib/utils";
import { ProductDetail } from "@/components/products/product-detail";
import { ProductCard } from "@/components/products/product-card";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      sizes: { orderBy: { size: "asc" } },
      category: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { sizes: true },
  });

  return (
    <div className="bg-white">
      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="section-padding border-t border-border bg-light-gray">
          <div className="container-luxury">
            <h2 className="mb-12 font-display text-3xl font-bold text-charcoal">Related Products</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={Number(p.price)}
                  compareAt={p.compareAt ? Number(p.compareAt) : null}
                  wholesalePrice={p.wholesalePrice ? Number(p.wholesalePrice) : null}
                  wholesaleMinQty={p.wholesaleMinQty}
                  image={parseImages(p.images)[0]}
                  stock={p.sizes.reduce((sum, size) => sum + size.stock, 0)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
