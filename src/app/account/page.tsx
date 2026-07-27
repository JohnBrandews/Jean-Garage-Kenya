import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SetPasswordForm } from "@/components/account/set-password-form";

export const metadata = { title: "My Account" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const [userRecord, orders, addresses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
  ]);
  const hasPassword = Boolean(userRecord?.password);

  return (
    <div className="section-padding bg-white">
      <div className="container-luxury">
        <h1 className="font-display text-4xl font-bold text-charcoal">My Account</h1>
        <p className="mt-2 text-gray-500">Welcome, {session.user.name}</p>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="border border-border p-6">
            <h2 className="font-display text-xl font-bold">Profile</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {session.user.name}</p>
              <p><span className="text-gray-500">Email:</span> {session.user.email}</p>
              <p><span className="text-gray-500">Role:</span> {session.user.role}</p>
              <p><span className="text-gray-500">Password login:</span> {hasPassword ? "Enabled" : "Not set yet"}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!hasPassword && (
              <div className="mb-8 border border-gold/30 bg-[#fcf8ef] p-6">
                <h2 className="font-display text-xl font-bold">Set a Password</h2>
                <p className="mt-2 text-sm text-gray-600">
                  This account does not have a password yet. If you signed in with Google, create one here so you can
                  also use email and password next time.
                </p>
                <div className="mt-5">
                  <SetPasswordForm />
                </div>
              </div>
            )}

            <h2 className="font-display text-xl font-bold mb-6">Order History</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(Number(order.total))}</p>
                        <span className="text-xs font-bold uppercase tracking-widest text-gold">
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/track-order?orderNumber=${order.orderNumber}`}
                        className="inline-flex items-center border border-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-white"
                      >
                        Track the Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {addresses.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold mb-6">Saved Addresses</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="border border-border p-6 text-sm">
                  <p className="font-bold">{addr.label} {addr.isDefault && <span className="text-gold">(Default)</span>}</p>
                  <p className="mt-2">{addr.fullName}</p>
                  <p>{addr.address}, {addr.city}</p>
                  <p>{addr.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.user.role === "ADMIN" && (
          <div className="mt-12">
            <Link href="/admin">
              <Button variant="gold">Go to Admin Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
