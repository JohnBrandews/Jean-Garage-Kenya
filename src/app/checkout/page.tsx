"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice, getKenyaShippingCost } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof checkoutSchema>, unknown, CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "Kenya",
      shippingRegion: "KENYA",
      paymentMethod: "PAYSTACK",
      currency: "KES",
    },
  });

  const shippingRegion = useWatch({ control, name: "shippingRegion" });
  const city = useWatch({ control, name: "city" });
  const county = useWatch({ control, name: "county" });
  const shippingCosts = {
    KENYA: getKenyaShippingCost(city, county),
    EAST_AFRICA: 1500,
    INTERNATIONAL: 3500,
  };
  const shippingCost = shippingCosts[shippingRegion as keyof typeof shippingCosts] || 300;
  const orderTotal = total + shippingCost;

  if (items.length === 0) {
    return (
      <div className="section-padding text-center">
        <h1 className="font-display text-4xl font-bold">Checkout</h1>
        <p className="mt-4 text-gray-500">Your cart is empty.</p>
        <Link href="/products" className="mt-8 inline-block">
          <Button variant="primary">Shop Now</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
          subtotal: total,
          shippingCost,
          total: orderTotal,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Checkout failed");

      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
      } else {
        clearCart();
        router.push(`/order-confirmation?order=${result.orderNumber}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding bg-white">
      <div className="container-luxury">
        <h1 className="font-display text-4xl font-bold text-charcoal">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <section>
              <h2 className="mb-6 font-display text-xl font-bold">Shipping Address</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} />
                <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
                <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
                <Input label="City" {...register("city")} error={errors.city?.message} />
              </div>
              <div className="mt-6">
                <Input label="Address" {...register("address")} error={errors.address?.message} />
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Input label="County" {...register("county")} />
                <Input label="Country" {...register("country")} />
              </div>
            </section>

            <section>
              <h2 className="mb-6 font-display text-xl font-bold">Delivery Method</h2>
              <div className="space-y-3">
                {[
                  { value: "KENYA", label: "Kenya - KES 100 in Nairobi, KES 300 elsewhere" },
                  { value: "EAST_AFRICA", label: "East Africa - KES 1,500" },
                  { value: "INTERNATIONAL", label: "International - KES 3,500" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-gold">
                    <input type="radio" value={opt.value} {...register("shippingRegion")} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-6 font-display text-xl font-bold">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: "PAYSTACK", label: "Paystack (Card, M-Pesa, Visa, Mastercard)" },
                  { value: "MPESA", label: "M-Pesa Direct" },
                  { value: "CARD", label: "Credit/Debit Card" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 border border-border p-4 cursor-pointer hover:border-gold">
                    <input type="radio" value={opt.value} {...register("paymentMethod")} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div>
            <div className="border border-border p-8 sticky top-24">
              <h2 className="font-display text-xl font-bold">Order Summary</h2>
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity} ({item.size})</span>
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>{formatPrice(orderTotal)}</span>
                  </div>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              <Button type="submit" variant="primary" className="w-full mt-8" disabled={loading}>
                {loading ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
