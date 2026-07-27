import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Search,
  Bell,
  Eye,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

type StatusBucket = {
  status: string;
  _sum: { total: string | number | null };
};

const paidRevenueStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const revenueWhere: Prisma.OrderWhereInput = {
  OR: [
    { paymentStatus: "paid" },
    { status: { in: paidRevenueStatuses } },
  ],
};

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    revenueAggregate,
    ordersToday,
    totalCustomers,
    lowStock,
    outOfStockCount,
    totalInventoryUnits,
    recentOrders,
    statusBuckets,
    recentRevenue,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: revenueWhere,
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.productSize.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true } } },
      take: 4,
    }),
    prisma.productSize.count({ where: { stock: { lte: 0 } } }),
    prisma.productSize.aggregate({
      _sum: { stock: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.groupBy({
      where: revenueWhere,
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: {
        AND: [{ createdAt: { gte: sevenDaysAgo } }, revenueWhere],
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const dailyRevenue = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const total = recentRevenue.reduce((sum, order) => {
      return order.createdAt.toISOString().slice(0, 10) === key ? sum + Number(order.total) : sum;
    }, 0);
    return {
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date).toUpperCase(),
      value: total,
    };
  });

  return {
    totalRevenue: Number(revenueAggregate._sum.total || 0),
    ordersToday,
    totalCustomers,
    lowStock,
    outOfStockCount,
    totalInventoryUnits: Number(totalInventoryUnits._sum.stock || 0),
    recentOrders,
    statusBuckets: statusBuckets as StatusBucket[],
    dailyRevenue,
  };
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "neutral" | "warning" | "accent";
}) {
  const toneStyles =
    tone === "warning"
      ? "border-red-200 text-red-600"
      : tone === "accent"
        ? "border-gold text-gold"
        : "border-black/10 text-charcoal";

  return (
    <div className="editorial-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-charcoal/55">{label}</p>
          <p className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-charcoal">{value}</p>
          <p className="mt-2 text-sm text-charcoal/55">{note}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center border ${toneStyles}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function BarChartCard({
  title,
  bars,
  legend,
}: {
  title: string;
  bars: Array<{ label: string; value: number }>;
  legend?: ReactNode;
}) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="editorial-panel p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-charcoal">{title}</h2>
        {legend}
      </div>
      <div className="flex h-72 items-end gap-4">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-56 w-full items-end justify-center">
              <div
                className="w-full max-w-16 bg-gradient-to-t from-gold-dark to-gold"
                style={{ height: `${Math.max((bar.value / max) * 100, 8)}%` }}
              />
            </div>
            <span className="text-[0.7rem] font-medium tracking-[0.22em] text-charcoal/50">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      note: "+12.5% vs last month",
      icon: DollarSign,
      tone: "accent" as const,
    },
    {
      label: "Orders Today",
      value: String(stats.ordersToday),
      note: "+8.2% vs yesterday",
      icon: ShoppingCart,
      tone: "accent" as const,
    },
    {
      label: "Total Customers",
      value: String(stats.totalCustomers),
      note: "Stable growth",
      icon: Users,
    },
    {
      label: "Low Stock Alerts",
      value: String(stats.lowStock.length),
      note: `${stats.outOfStockCount} out of stock | ${stats.totalInventoryUnits} units available`,
      icon: AlertTriangle,
      tone: "warning" as const,
    },
  ];

  const revenueLegend = (
    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-charcoal/55">
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-gold" /> Online
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-gold-dark" /> Retail
      </span>
    </div>
  );

  const statusLegend = (
    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-charcoal/55">
      <span>Last 7 Days</span>
      <span className="text-gold">Overview</span>
    </div>
  );

  return (
    <div className="dashboard-shell min-h-screen px-6 py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 border-b border-black/5 pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-charcoal">Overview</h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Welcome back, Admin. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
          <div className="editorial-panel flex w-full min-w-0 items-center gap-3 px-4 py-3 sm:min-w-[16rem]">
            <Search className="h-4 w-4 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search data..."
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-charcoal/40"
            />
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-charcoal">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-11 w-11 overflow-hidden rounded-full border border-black/10 bg-charcoal">
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_36%),linear-gradient(135deg,#1f2633,#111827)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <BarChartCard
          title="Sales Trends"
          bars={stats.dailyRevenue}
          legend={statusLegend}
        />
        <div className="editorial-panel p-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-charcoal">Revenue Breakdown</h2>
            {revenueLegend}
          </div>
          <div className="grid h-72 grid-cols-4 items-end gap-4">
            {stats.statusBuckets.slice(0, 4).map((bucket) => {
              const amount = Number(bucket._sum.total || 0);
              const max = Math.max(...stats.statusBuckets.map((item) => Number(item._sum.total || 0)), 1);
              return (
                <div key={bucket.status} className="flex h-full flex-col items-center justify-end gap-3">
                  <div className="flex h-56 w-full items-end justify-center">
                    <div
                      className="w-full max-w-16 bg-gradient-to-t from-gold-dark to-gold"
                      style={{ height: `${Math.max((amount / max) * 100, 10)}%` }}
                    />
                  </div>
                  <span className="text-[0.7rem] font-medium tracking-[0.22em] text-charcoal/50">{bucket.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="editorial-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
            <h2 className="font-display text-2xl font-bold text-charcoal">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-bold uppercase tracking-[0.22em] text-gold hover:text-gold-dark">
              View All Orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-black/5 bg-white/60 text-xs uppercase tracking-[0.2em] text-charcoal/45">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {stats.recentOrders.map((order) => {
                  const status = order.status.toLowerCase();
                  const statusClasses: Record<string, string> = {
                    pending: "bg-red-100 text-red-700",
                    paid: "bg-yellow-100 text-yellow-700",
                    processing: "bg-amber-100 text-amber-700",
                    shipped: "bg-slate-100 text-slate-700",
                    delivered: "bg-green-100 text-green-700",
                    cancelled: "bg-gray-100 text-gray-700",
                  };

                  return (
                    <tr key={order.id} className="text-sm">
                      <td className="px-6 py-5 font-bold text-charcoal">{order.orderNumber}</td>
                      <td className="px-6 py-5 text-charcoal/70">
                        <div>{order.user.name}</div>
                        <div className="text-xs text-charcoal/40">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-5 text-charcoal/65">
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(order.createdAt)}
                      </td>
                      <td className="px-6 py-5 font-bold text-charcoal">{formatPrice(Number(order.total))}</td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] ${statusClasses[status] || "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button className="text-charcoal/60 transition-colors hover:text-gold" aria-label={`View ${order.orderNumber}`}>
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="editorial-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-charcoal">Low Stock</h2>
              <Link href="/admin/products" className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
                Review Inventory
              </Link>
            </div>
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-charcoal/55">All products are sufficiently stocked.</p>
            ) : (
              <div className="space-y-4">
                {stats.lowStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-black/5 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium text-charcoal">{item.product.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-charcoal/45">Size {item.size}</p>
                    </div>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="editorial-panel p-6">
            <h2 className="font-display text-2xl font-bold text-charcoal">Quick Actions</h2>
            <div className="mt-4 grid gap-3">
              <Link href="/admin/products" className="border border-black/10 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-gold hover:text-gold">
                Manage Products
              </Link>
              <Link href="/admin/orders" className="border border-black/10 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-gold hover:text-gold">
                Process Orders
              </Link>
              <Link href="/admin/settings" className="border border-black/10 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-gold hover:text-gold">
                Store Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
