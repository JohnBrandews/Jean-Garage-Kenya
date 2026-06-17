"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
  children: ReactNode;
};

const authNav = [
  { href: "/products", label: "Collections" },
  { href: "/products?category=jeans", label: "Denim" },
  { href: "/products?sort=newest", label: "New Arrivals" },
  { href: "/track-order", label: "Track Order" },
];

export function AuthPageShell({
  title,
  subtitle,
  footerText,
  footerHref,
  footerLinkLabel,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f2e9] text-[#17141b]">
      <header className="border-b border-black/5 bg-[rgba(247,242,233,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(20,20,20,0.12)] ring-2 ring-[#d6c08a]/35">
              <Image
                src="/jean.png"
                alt="Jeans Garage logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
            </span>
            <span className="font-display text-2xl font-semibold tracking-[0.14em] text-[#1e1720] md:text-[2rem]">
              JEANS GARAGE
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {authNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#4b4451] transition-colors hover:text-[#a6812f]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:min-h-[calc(100vh-5.75rem)] lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-8">
        <section className="relative hidden overflow-hidden rounded-[2rem] bg-[#16131a] text-white shadow-[0_30px_80px_rgba(18,18,18,0.28)] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.24),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,#1a1820_0%,#0f0d12_100%)]" />
          <div className="relative flex h-full min-h-[720px] flex-col justify-between p-10">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.34em] text-white/55">
              <Sparkles className="h-4 w-4 text-[#d8b14d]" />
              Secure customer access
            </div>

            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.42em] text-[#d8b14d]">Jeans Garage Kenya</p>
              <h2 className="mt-6 max-w-lg font-display text-5xl leading-[1.05] font-semibold text-white">
                Tailored denim,
                <span className="block text-[#d8b14d]">made for the street.</span>
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
                Sign in to track orders, save your details, and keep your cart synced across every visit.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-end">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                <Image
                  src="/jean.png"
                  alt="Jeans Garage mark"
                  width={72}
                  height={72}
                  className="h-16 w-16 rounded-full bg-white object-contain p-2 shadow-lg"
                />
                  <div>
                    <p className="text-sm font-semibold text-white">JEANS GARAGE</p>
                    <p className="text-xs text-white/55">Authentic denim, premium fit.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.34em] text-white/45">Editorial note</p>
                <p className="mt-3 text-base leading-7 text-white/75">
                  Access your dashboard, orders, and cart from a single account. Admin users can manage products and
                  shipping updates from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[#d9cdb9] bg-[#fefbf6] px-5 py-8 shadow-[0_24px_80px_rgba(36,28,10,0.10)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#8d7440]">JEANS GARAGE ACCESS</p>
            <div className="mt-5">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-[#17141b] sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5f5865]">{subtitle}</p>
            </div>

            <div className="mt-8">{children}</div>

            <div className="mt-8 border-t border-[#ddd3c1] pt-6 text-sm text-[#5f5865]">
              {footerText}{" "}
              <Link href={footerHref} className="inline-flex items-center gap-2 font-semibold text-[#8a6a19] hover:text-[#a57d1d]">
                {footerLinkLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
