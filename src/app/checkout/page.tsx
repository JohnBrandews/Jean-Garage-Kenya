"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { z } from "zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { useCart } from "@/components/providers/cart-provider";
import { calculateUnitPrice, formatPrice, getKenyaShippingCost, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const paystackChannels = [
  { label: "Card", detail: "Visa, Mastercard, and local debit" },
  { label: "M-Pesa", detail: "Kenyan mobile money checkout" },
  { label: "Transfer", detail: "Bank transfer and supported channels" },
];

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
        <h1 className="section-heading">Checkout</h1>
        <p className="eyebrow-copy mt-4">Your cart is empty.</p>
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
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: calculateUnitPrice(item, item.quantity),
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
        return;
      }

      clearCart();
      router.push(`/order-confirmation?order=${result.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-luxury">
        <div className="max-w-3xl">
          <p className="section-label mb-4">Checkout</p>
          <h1 className="section-heading">Finalize your premium denim acquisition.</h1>
          <p className="eyebrow-copy mt-4 max-w-2xl">
            Complete your shipping details and Paystack will handle the payment experience with card, M-Pesa, or bank
            transfer options in one secure flow.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]"
        >
          <div className="space-y-8">
            <section className="editorial-panel p-6 md:p-8">
              <div className="mb-8 flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                  01
                </span>
                <div>
                  <p className="section-label">Shipping Information</p>
                  <p className="mt-1 text-sm text-charcoal/55">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} />
                <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} />
                <Input label="Phone Number" {...register("phone")} error={errors.phone?.message} />
                <Input label="City" {...register("city")} error={errors.city?.message} />
              </div>

              <div className="mt-6">
                <Input label="Street Address" {...register("address")} error={errors.address?.message} />
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Input label="County" {...register("county")} />
                <Input label="Country" {...register("country")} />
              </div>

              <input type="hidden" {...register("paymentMethod")} />
              <input type="hidden" {...register("currency")} />
            </section>

            <section className="editorial-panel p-6 md:p-8">
              <div className="mb-8 flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                  02
                </span>
                <div>
                  <p className="section-label">Payment Method</p>
                  <p className="mt-1 text-sm text-charcoal/55">
                    One secure Paystack checkout for all supported channels.
                  </p>
                </div>
              </div>

              <div className="group block">
                <div className="overflow-hidden border border-gold/25 bg-white shadow-[0_18px_50px_rgba(31,38,51,0.06)] transition-transform duration-300 group-hover:-translate-y-0.5">
                  <div className="border-b border-black/5 bg-[linear-gradient(135deg,rgba(176,138,47,0.08),rgba(255,255,255,0.92))] p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-[0_10px_24px_rgba(176,138,47,0.25)]">
                          <Banknote className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-charcoal/55">
                            Payment Provider
                          </p>
                          <h2 className="mt-2 font-display text-3xl font-bold text-charcoal">Paystack</h2>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-charcoal/65">
                            You will be redirected to Paystack&apos;s secure checkout to complete your purchase using
                            your preferred channel.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-full border border-gold/20 bg-white px-4 py-2 text-right">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-charcoal/45">
                          Total Payable
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold text-gold-dark">
                          {formatPrice(orderTotal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-b border-black/5 bg-white px-6 py-5 sm:grid-cols-3">
                    {paystackChannels.map((channel) => (
                      <div
                        key={channel.label}
                        className="rounded-2xl border border-black/5 bg-light-gray/40 px-4 py-4 text-center"
                      >
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-charcoal">{channel.label}</p>
                        <p className="mt-2 text-xs leading-5 text-charcoal/55">{channel.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
                    <div className="flex items-center gap-3 text-sm text-charcoal/70">
                      <ShieldCheck className="h-4 w-4 text-gold" />
                      PCI DSS compliant
                    </div>
                    <div className="flex items-center gap-3 text-sm text-charcoal/70">
                      <LockKeyhole className="h-4 w-4 text-gold" />
                      Secure Paystack redirect
                    </div>
                    <div className="flex items-center gap-3 text-sm text-charcoal/70">
                      <Sparkles className="h-4 w-4 text-gold" />
                      Card, M-Pesa, transfer
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="editorial-panel h-fit p-6 md:p-8 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl font-bold text-charcoal">Order Summary</h2>

            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const unitPrice = calculateUnitPrice(item, item.quantity);
                return (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex items-start justify-between gap-4 border-b border-black/5 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-charcoal">{item.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-charcoal/45">
                        Size {item.size} | Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-charcoal">{formatPrice(unitPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-black/5 pt-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-charcoal/65">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-charcoal/65">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-4 text-base font-bold text-charcoal">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="gold"
              className="mt-8 w-full justify-between gap-3 rounded-none px-6 py-4 text-sm tracking-[0.22em]"
              disabled={loading}
            >
              <span>{loading ? "Processing..." : "Pay with Paystack"}</span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-white/30",
                  loading ? "opacity-70" : ""
                )}
              >
                {"->"}
              </span>
            </Button>

            <p className="mt-4 text-center text-xs leading-6 text-charcoal/45">
              By placing this order you agree to our terms and payment verification flow.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
