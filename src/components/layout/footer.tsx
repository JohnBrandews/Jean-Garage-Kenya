import Link from "next/link";
import { Globe, Share2, AtSign, ArrowRight } from "lucide-react";

const footerLinks = {
  shop: [
    { href: "/products", label: "New Arrivals" },
    { href: "/products?featured=true", label: "Best Sellers" },
    { href: "/products?category=jeans", label: "Denim Guide" },
    { href: "/products", label: "Archive" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
    { href: "/track-order", label: "Track Order" },
    { href: "/products", label: "Store Locator" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="container-luxury section-padding">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block max-w-[10rem] font-display text-3xl font-bold leading-none text-gold">
              JEANS GARAGE
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
              Forging the future of denim through urban craftsmanship and couture precision.
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#" className="text-white/50 transition-colors hover:text-gold" aria-label="Instagram">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/50 transition-colors hover:text-gold" aria-label="Facebook">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/50 transition-colors hover:text-gold" aria-label="Twitter">
                <AtSign className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="text-sm text-white/45 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="text-sm text-white/45 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold">Newsletter</h4>
            <p className="mb-5 text-sm leading-relaxed text-white/45">
              Join the archive for early access to seasonal drops and private releases.
            </p>
            <form className="flex items-end gap-3 border-b border-white/20 pb-3">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center text-gold transition-colors hover:text-white"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs uppercase tracking-[0.2em] text-white/25">
            &copy; {new Date().getFullYear()} JEANS GARAGE. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
