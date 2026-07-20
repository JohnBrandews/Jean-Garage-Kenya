import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { parseImages } from "@/lib/utils";
import { ProductsFilter } from "@/components/products/products-filter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    featured?: string;
  }>;
}

const PAGE_SIZE = 12;

export const metadata = {
  title: "Premium Denim",
  description: "Browse the JEANS GARAGE archive of premium jeans, clothing, footwear, and accessories.",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { description: { contains: params.search } },
    ];
  }

  if (params.featured === "true") {
    where.featured = true;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
  }

  if (params.size) {
    where.sizes = { some: { size: params.size, stock: { gt: 0 } } };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (params.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: { sizes: true, category: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingStart = total === 0 ? 0 : skip + 1;
  const showingEnd = Math.min(skip + PAGE_SIZE, total);
  const queryString = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, value]) => Boolean(value))) as Record<string, string>
  );

  return (
    <div className="section-padding">
      <div className="container-luxury">
        <div className="mb-12 max-w-3xl">
          <p className="section-label mb-4">Archive</p>
          <h1 className="section-heading">Premium Denim</h1>
          <p className="eyebrow-copy mt-5 max-w-2xl">
            Discover our curated selection of architectural denim, tailored separates, and statement pieces designed
            for the modern wardrobe.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <p className="text-sm text-charcoal/70">
            Showing {showingStart}-{showingEnd} of {total} results
          </p>
          <div className="flex items-center gap-3 text-sm text-charcoal/60">
            <span>View</span>
            <div className="flex gap-2">
              <span className="flex h-9 w-9 items-center justify-center border border-gold bg-gold text-xs font-bold uppercase tracking-[0.18em] text-white">
                Grid
              </span>
              <span className="flex h-9 w-9 items-center justify-center border border-border text-xs font-bold uppercase tracking-[0.18em]">
                List
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <Suspense
            fallback={
              <aside className="w-full shrink-0 lg:w-[18rem]">
                <div className="space-y-6">
                  <div className="h-5 w-28 animate-pulse bg-light-gray" />
                  <div className="h-36 animate-pulse bg-light-gray" />
                  <div className="h-32 animate-pulse bg-light-gray" />
                </div>
              </aside>
            }
          >
            <ProductsFilter categories={categories} currentParams={params} />
          </Suspense>

          <div className="flex-1">
            {products.length === 0 ? (
              <div className="editorial-panel flex min-h-[24rem] items-center justify-center px-6 py-20 text-center">
                <div>
                  <p className="font-display text-2xl text-charcoal">No products found</p>
                  <p className="mt-3 text-sm text-charcoal/55">Try changing the category, size, or search term.</p>
                  <Link href="/products" className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                    Reset filters
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={Number(product.price)}
                      compareAt={product.compareAt ? Number(product.compareAt) : null}
                      wholesalePrice={product.wholesalePrice ? Number(product.wholesalePrice) : null}
                      wholesaleMinQty={product.wholesaleMinQty}
                      image={parseImages(product.images)[0]}
                      stock={product.sizes.reduce((sum, size) => sum + size.stock, 0)}
                      badge={product.isNew ? "new" : product.isBestSeller ? "bestseller" : product.featured ? "featured" : null}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-3">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/products?${new URLSearchParams({ ...Object.fromEntries(queryString.entries()), page: String(p) })}`}
                        className={`flex h-10 min-w-10 items-center justify-center border px-3 text-sm font-bold transition-colors ${
                          p === page ? "border-gold bg-gold text-white" : "border-border bg-transparent text-charcoal hover:border-gold"
                        }`}
                      >
                        {String(p).padStart(2, "0")}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
