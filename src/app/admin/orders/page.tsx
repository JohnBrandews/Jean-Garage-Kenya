import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderActionsDropdown } from "@/components/admin/order-actions-dropdown";

export const metadata = { title: "Manage Orders" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-charcoal">Orders</h1>
      <p className="mt-1 text-gray-500">{orders.length} total orders</p>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-bold text-lg">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.user.name} — {order.user.email}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatPrice(Number(order.total))}</p>
                <p className="text-xs text-gray-500">Payment: {order.paymentStatus}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {order.items.map((item) => (
                <span key={item.id} className="mr-4">
                  {item.product.name} × {item.quantity} ({item.size})
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <OrderActionsDropdown orderId={order.id} currentStatus={order.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
