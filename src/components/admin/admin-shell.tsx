"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="dashboard-shell min-h-screen lg:pl-72">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-charcoal/95 text-white backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div>
            <p className="font-display text-lg font-bold leading-none text-gold">JEANS GARAGE</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.28em] text-white/45">Admin Console</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
            aria-label="Toggle admin navigation"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-30 bg-charcoal/55 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <main className="min-h-screen pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
