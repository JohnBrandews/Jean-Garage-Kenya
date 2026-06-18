"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/products", label: "Collections" },
  { href: "/products?category=jeans", label: "Denim" },
  { href: "/products?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const dashboardHref = session?.user?.role === "ADMIN" ? "/admin" : "/account";

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(247,244,239,0.92)] backdrop-blur-xl">
      <div className="container-luxury">
        <div className="flex h-20 items-center gap-3 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Image
              src="/jean.png"
              alt="JEANS GARAGE logo"
              width={48}
              height={48}
              className="h-11 w-11 rounded-full bg-white object-contain p-1 shadow-[0_10px_24px_rgba(0,0,0,0.12)] ring-2 ring-[#d7c08e]/35 sm:h-14 sm:w-14 sm:p-1.5"
              priority
            />
            <span className="font-display text-[0.78rem] font-bold tracking-[0.2em] text-[#1d1816] [text-shadow:0_1px_0_rgba(255,255,255,0.85)] sm:text-xl sm:tracking-[0.12em] md:text-[2.1rem]">
              JEANS GARAGE
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="nav-link text-charcoal/80 transition-colors hover:text-charcoal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-4 md:gap-5">
            <Link href="/products" className="hidden text-charcoal transition-colors hover:text-gold sm:inline-flex" aria-label="Search the store">
              <Search className="h-5 w-5" />
            </Link>
            {!session?.user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/login"
                  className="inline-flex items-center border border-charcoal/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-charcoal hover:border-gold hover:text-gold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-gold-dark"
                >
                  Register
                </Link>
              </div>
            ) : null}
            {session?.user ? (
              <div className="group relative hidden sm:block">
                <Link
                  href={dashboardHref}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 text-charcoal transition-colors hover:border-gold hover:text-gold"
                  aria-label="Profile"
                >
                  <User className="h-5 w-5" />
                </Link>
                <div className="invisible absolute right-0 top-full z-30 mt-3 w-52 translate-y-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="overflow-hidden border border-black/10 bg-white">
                    <Link href="/" className="block px-4 py-3 text-sm text-charcoal hover:bg-light-gray">
                      Home
                    </Link>
                    <Link href={dashboardHref} className="block px-4 py-3 text-sm text-charcoal hover:bg-light-gray">
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full px-4 py-3 text-left text-sm text-charcoal hover:bg-light-gray"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/5 text-charcoal transition-colors hover:border-gold hover:text-gold sm:flex"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-gold" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/85 text-charcoal shadow-sm transition-colors hover:border-gold hover:text-gold lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={cn("border-t border-black/5 bg-[rgba(247,244,239,0.98)] lg:hidden", mobileOpen ? "block" : "hidden")}>
        <nav className="container-luxury flex flex-col gap-4 py-5">
          {navLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="nav-link text-charcoal"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/track-order" className="nav-link text-charcoal" onClick={() => setMobileOpen(false)}>
            Track Order
          </Link>
          {!session?.user ? (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center border border-charcoal/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-charcoal"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Link
                href={dashboardHref}
                className="inline-flex items-center justify-center border border-charcoal/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-charcoal"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="inline-flex items-center justify-center bg-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white"
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
