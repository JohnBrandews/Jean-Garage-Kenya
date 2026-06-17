"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="section-padding bg-white">
        <div className="container-luxury text-center">
          <h1 className="font-display text-4xl font-bold text-charcoal">Your Cart</h1>
          <p className="mt-4 text-gray-500">Your cart is empty.</p>
          <Link href="/products" className="mt-8 inline-block">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-white">
      <div className="container-luxury">
        <h1 className="font-display text-4xl font-bold text-charcoal">
          Your Cart ({itemCount})
        </h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-6 border-b border-border pb-6"
              >
                <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-light-gray">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-display text-lg font-semibold hover:text-gold">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                    <p className="mt-1 font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-light-gray"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-light-gray"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-border p-8 h-fit">
            <h2 className="font-display text-xl font-bold">Order Summary</h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping (est.)</span>
                <span className="font-bold">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-8 block">
              <Button variant="primary" className="w-full">
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
