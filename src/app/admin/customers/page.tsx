import { prisma } from "@/lib/prisma";

export const metadata = { title: "Manage Customers" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-charcoal">Customers</h1>
      <p className="mt-1 text-gray-500">{customers.length} customers</p>

      <div className="mt-8 border border-border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-light-gray">
            <tr>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Orders</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-border">
                <td className="px-6 py-4 font-semibold">{customer.name}</td>
                <td className="px-6 py-4 text-gray-500">{customer.email}</td>
                <td className="px-6 py-4">{customer._count.orders}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
