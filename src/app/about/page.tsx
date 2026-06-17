import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us",
  description: "Learn about JEANS GARAGE, premium fashion retail since 2015.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative flex min-h-[50vh] items-center bg-charcoal">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
          alt="About JEANS GARAGE"
          fill
          className="object-cover opacity-50"
        />
        <div className="container-luxury relative z-10 py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Since 2015</p>
          <h1 className="mt-4 font-display text-5xl font-bold text-white md:text-6xl">Our Story</h1>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-luxury mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-gray-600">
            Founded in 2015 in the heart of Nairobi, JEANS GARAGE began as a passion project to bring premium
            streetwear and luxury denim to Kenya and beyond. What started as a small boutique has grown into a
            destination for fashion-forward individuals who demand quality, style, and authenticity.
          </p>
        </div>
      </section>

      <section className="section-padding bg-light-gray">
        <div className="container-luxury grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-charcoal">Our Mission</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              To democratize luxury fashion by offering premium quality garments at accessible prices, while
              celebrating African style and global streetwear culture.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-charcoal">Our Vision</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              To become East Africa&apos;s leading fashion destination - a brand synonymous with quality, innovation,
              and the bold spirit of Kenyan style.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-charcoal text-center text-white">
        <h2 className="font-display text-3xl font-bold">Brand History</h2>
        <div className="container-luxury mt-12 grid gap-8 md:grid-cols-4">
          {[
            { year: "2015", event: "Founded in Nairobi" },
            { year: "2018", event: "Expanded to online sales" },
            { year: "2021", event: "International shipping launched" },
            { year: "2024", event: "500+ products in catalog" },
          ].map(({ year, event }) => (
            <div key={year} className="border border-gold/30 p-6">
              <p className="font-display text-3xl font-bold text-gold">{year}</p>
              <p className="mt-2 text-sm text-gray-400">{event}</p>
            </div>
          ))}
        </div>
        <Link href="/products" className="mt-12 inline-block">
          <Button variant="gold">Explore Collection</Button>
        </Link>
      </section>
    </>
  );
}
