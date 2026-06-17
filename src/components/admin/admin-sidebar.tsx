import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Settings,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-charcoal text-white">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link href="/admin" className="font-display text-xl font-bold leading-none text-gold">
          JEANS GARAGE
          <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.28em] text-white/45">Admin Console</span>
        </Link>
      </div>
      <nav className="mt-6 space-y-1 px-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-white/45 transition-colors hover:bg-white/5 hover:text-gold"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-gold px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-gold-dark"
        >
          <ArrowLeft className="h-4 w-4" /> View Storefront
        </Link>
      </div>
    </aside>
  );
}
