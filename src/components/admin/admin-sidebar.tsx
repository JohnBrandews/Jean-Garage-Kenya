"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type AdminSidebarProps = {
  mobileOpen: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({ mobileOpen, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-charcoal text-white transition-transform duration-300 ease-out lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-xl font-bold leading-none text-gold"
        >
          JEANS GARAGE
          <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.28em] text-white/45">
            Admin Console
          </span>
        </Link>
      </div>

      <nav className="mt-6 space-y-1 px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-white/10 text-gold shadow-[inset_0_0_0_1px_rgba(176,138,47,0.22)]"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 bg-gold px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-gold-dark"
        >
          <ArrowLeft className="h-4 w-4" /> View Storefront
        </Link>
      </div>
    </aside>
  );
}
