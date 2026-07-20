import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Sparkles, BadgePercent } from "lucide-react";

async function getHomeData() {
  const [featured, newArrivals, bestSellers] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 4,
      include: { sizes: true, category: true },
    }),
    prisma.product.findMany({
      where: { isNew: true },
      take: 4,
      include: { sizes: true },
    }),
    prisma.product.findMany({
      where: { isBestSeller: true },
      take: 4,
      include: { sizes: true },
    }),
  ]);

  return { featured, newArrivals, bestSellers };
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="section-label mb-3">{eyebrow}</p>
        <h2 className="section-heading text-[clamp(2rem,3vw,3.4rem)]">{title}</h2>
        <p className="eyebrow-copy mt-4">{description}</p>
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gold transition-colors hover:text-gold-dark md:inline-flex"
        >
          {actionLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { featured, newArrivals, bestSellers } = await getHomeData();
  const heroImage =
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1800&q=80&auto=format&fit=crop";

  return (
    <>
      <section className="relative overflow-hidden bg-[#232838]">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="JEANS GARAGE hero"
            fill
            priority
            className="object-cover object-center opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(176,138,47,0.14),transparent_35%),linear-gradient(180deg,rgba(17,24,39,0.12),rgba(17,24,39,0.72))]" />
        </div>

        <div className="container-luxury relative z-10 flex min-h-[84vh] items-end py-16 md:min-h-[88vh] md:py-20">
          <div className="max-w-3xl pb-10">
            <div className="mb-6 inline-flex items-center gap-4 rounded-full border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <Image src="/jean.png" alt="JEANS GARAGE logo" width={56} height={56} className="h-12 w-12 object-contain" />
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/60">Official Store</p>
                <p className="font-display text-lg font-semibold tracking-[0.2em] text-white">JEANS GARAGE</p>
              </div>
            </div>
            <p className="section-label mb-5 text-gold/90">Est. 2015 - Kenya</p>
            <h1 className="max-w-2xl font-display text-5xl font-bold uppercase leading-[0.9] tracking-[-0.06em] text-white md:text-7xl lg:text-[6.5rem]">
              The Denim
              <span className="block">Archive</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/75 md:text-base">
              Premium jeans, elevated basics, and statement layers for a wardrobe that feels sharp, modern, and
              unmistakably Kenyan.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="secondary" size="lg" className="border-white bg-white text-charcoal hover:border-white hover:bg-white">
                  Shop the Collection
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-white/70 text-white hover:bg-white hover:text-charcoal">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-luxury">
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/products?category=jeans" className="group relative overflow-hidden bg-charcoal md:col-span-2 md:row-span-2">
              <Image
                src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=80&auto=format&fit=crop"
                alt="Men's jeans"
                width={900}
                height={1200}
                className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/70">Men</p>
                <p className="mt-2 font-display text-2xl font-semibold">Explore Essentials</p>
              </div>
            </Link>

            <Link href="/products?category=women" className="group relative overflow-hidden bg-surface">
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80&auto=format&fit=crop"
                alt="Women's styling"
                width={900}
                height={1200}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/70">Women</p>
                <p className="mt-2 font-display text-xl font-semibold">The New Silhouette</p>
              </div>
            </Link>

            <Link href="/products?category=accessories" className="group relative overflow-hidden bg-surface">
              <Image
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&q=80&auto=format&fit=crop"
                alt="Accessories"
                width={900}
                height={1200}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/70">Accessories</p>
                <p className="mt-2 font-display text-xl font-semibold">Fine Accents</p>
              </div>
            </Link>

            <Link href="/products?sort=newest" className="group relative overflow-hidden bg-charcoal md:col-span-4">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=80&auto=format&fit=crop"
                alt="Archive collections"
                width={1800}
                height={700}
                className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border border-white/40 px-8 py-5 text-center text-white backdrop-blur-sm">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/75">The Archive</p>
                  <p className="mt-2 font-display text-2xl uppercase tracking-[0.08em]">Vintage to Rare Collections</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="section-padding">
          <div className="container-luxury">
            <SectionHeader
              eyebrow="Season 01"
              title="New Arrivals"
              description="Fresh drops, limited quantities, and elevated staples that move between street and studio with ease."
              actionHref="/products?sort=newest"
              actionLabel="View all"
            />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {newArrivals.map((product) => (
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
                  badge="new"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-16">
        <div className="container-luxury">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Truck, title: "International Shipping", desc: "Global dispatch from Nairobi with region-aware delivery options." },
              { icon: Sparkles, title: "Premium Quality", desc: "Sourced from the world's finest mills and finished for long wear." },
              { icon: Shield, title: "24/7 Support", desc: "Our concierge team is available around the clock for styling needs." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-gold text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-charcoal">{title}</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-charcoal/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section-padding">
          <div className="container-luxury">
            <SectionHeader
              eyebrow="Curated"
              title="Featured Pieces"
              description="The edit that anchors the season, balancing refined essentials with confident silhouettes."
            />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {featured.map((product) => (
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
                  badge="featured"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="bg-[#2b3244] py-20 text-white">
          <div className="container-luxury text-center">
            <BadgePercent className="mx-auto h-8 w-8 text-gold" />
            <blockquote className="mx-auto mt-8 max-w-4xl font-display text-2xl italic leading-relaxed md:text-4xl">
              &quot;JEANS GARAGE has redefined what luxury denim means in East Africa. The fit, the weight, and the soul of
              these pieces are unparalleled.&quot;
            </blockquote>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-white/60">KIMATHI MWAIERU</p>
            <p className="mt-2 text-sm text-white/50">Creative Director, Urban Ethos</p>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-luxury grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="section-label mb-4">Newsletter</p>
            <h2 className="section-heading text-[clamp(2rem,3vw,3rem)]">The Garage Newsletter</h2>
            <p className="eyebrow-copy mt-4 max-w-xl">
              Gain early access to archived releases and secret sales. Join the inner circle for the newest drops and
              style notes.
            </p>
          </div>
          <form className="flex items-end gap-4 border-b border-charcoal/20 pb-3">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-charcoal/35"
            />
            <button className="text-xs font-bold uppercase tracking-[0.3em] text-gold" type="submit">
              Join
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
