import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseImages, formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Wholesale",
  description: "Bulk-buy jeans and apparel with wholesale pricing at JEANS GARAGE.",
};

export default async function WholesalePage() {
  const wholesaleProducts = await prisma.product.findMany({
    where: { wholesalePrice: { not: null } },
    include: { sizes: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="section-padding">
      <div className="container-luxury">
        <div className="max-w-3xl">
          <p className="section-label mb-4">Wholesale</p>
          <h1 className="section-heading">Bulk pricing for retailers and resellers.</h1>
          <p className="eyebrow-copy mt-4 max-w-2xl">
            Browse products that unlock lower unit pricing once you reach the minimum quantity. The wholesale rate is
            shown openly on every product, and the cart will switch automatically when the threshold is met.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {wholesaleProducts.length === 0 ? (
            <div className="editorial-panel col-span-full px-6 py-16 text-center">
              <p className="font-display text-2xl text-charcoal">No wholesale products yet</p>
              <p className="mt-3 text-sm text-charcoal/55">
                Add a wholesale price to a product in the admin panel to feature it here.
              </p>
              <Link href="/admin/products/new" className="mt-6 inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Create wholesale product
              </Link>
            </div>
          ) : (
            wholesaleProducts.map((product) => (
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
                badge={product.featured ? "featured" : null}
              />
            ))
          )}
        </div>

        {wholesaleProducts.length > 0 && (
          <div className="mt-14 border-t border-border pt-8 text-sm text-charcoal/60">
            <p className="font-semibold text-charcoal">Wholesale examples</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {wholesaleProducts.slice(0, 2).map((product) => (
                <div key={product.id} className="editorial-panel p-4">
                  <p className="font-medium text-charcoal">{product.name}</p>
                  <p className="mt-1">
                    Retail {formatPrice(Number(product.price))} per piece.
                    {product.wholesalePrice ? ` Wholesale ${formatPrice(Number(product.wholesalePrice))} at ${product.wholesaleMinQty}+ pieces.` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
