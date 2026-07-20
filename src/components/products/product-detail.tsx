"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatPrice, parseImages, calculateUnitPrice, calculateWholesaleSavings } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { Star, Minus, Plus, Check, BadgePercent, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: { toString(): string } | number;
    compareAt: { toString(): string } | number | null;
    wholesalePrice: { toString(): string } | number | null;
    wholesaleMinQty: number | null;
    images: string;
    sizes: { id: string; size: string; stock: number }[];
    category: { name: string };
    reviews: { rating: number; comment: string | null; user: { name: string } }[];
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const images = parseImages(product.images);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    () => product.sizes.find((size) => size.stock > 0)?.size ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const price = Number(product.price);
  const compareAt = product.compareAt ? Number(product.compareAt) : null;
  const wholesalePrice =
    product.wholesalePrice === null || product.wholesalePrice === undefined
      ? null
      : Number(product.wholesalePrice);
  const wholesaleMinQty = product.wholesaleMinQty ?? null;
  const selectedSizeData = product.sizes.find((s) => s.size === selectedSize);
  const isOutOfStock = product.sizes.every((size) => size.stock <= 0);
  const avgRating =
    product.reviews.length > 0 ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length : 0;
  const unitPrice = calculateUnitPrice({ price, wholesalePrice, wholesaleMinQty }, quantity);
  const lineTotal = unitPrice * quantity;
  const wholesaleSavings = calculateWholesaleSavings({ price, wholesalePrice, wholesaleMinQty }, quantity);
  const wholesaleActive = wholesalePrice !== null && wholesaleMinQty !== null && quantity >= wholesaleMinQty;

  const quantityHint = useMemo(() => {
    if (!wholesalePrice || !wholesaleMinQty) {
      return null;
    }

    if (wholesaleActive) {
      return `Wholesale price applied at ${formatPrice(wholesalePrice)} per piece. You are saving ${formatPrice(wholesaleSavings)} on this order.`;
    }

    return `Add ${Math.max(wholesaleMinQty - quantity, 0)} more piece${wholesaleMinQty - quantity === 1 ? "" : "s"} to unlock wholesale pricing.`;
  }, [quantity, wholesaleActive, wholesaleMinQty, wholesalePrice, wholesaleSavings]);

  const handleAddToCart = () => {
    const sizeToAdd = selectedSize ?? product.sizes.find((size) => size.stock > 0)?.size ?? null;
    const sizeDataToAdd = product.sizes.find((size) => size.size === sizeToAdd);

    if (!sizeToAdd || !sizeDataToAdd || sizeDataToAdd.stock <= 0) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: images[0],
      price,
      wholesalePrice,
      wholesaleMinQty,
      size: sizeToAdd,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container-luxury section-padding">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden bg-light-gray">
            <Image
              src={images[selectedImage] || images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 overflow-hidden border-2 ${
                    selectedImage === i ? "border-gold" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gold">{product.category.name}</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-charcoal">{product.name}</h1>

          {product.reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-gold text-gold" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviews.length} reviews)</span>
            </div>
          )}

          <div className="mt-6 space-y-3 rounded-[1.5rem] border border-border bg-light-gray/35 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-charcoal/50">Retail price</p>
                <p className="mt-1 font-display text-2xl font-bold text-charcoal">{formatPrice(price)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-charcoal/50">Current total</p>
                <p className="mt-1 font-display text-2xl font-bold text-gold-dark">{formatPrice(lineTotal)}</p>
              </div>
            </div>

            {compareAt && compareAt > price && (
              <p className="text-sm text-gray-400 line-through">Compare at {formatPrice(compareAt)}</p>
            )}

            {wholesalePrice !== null && wholesaleMinQty !== null && (
              <div className="rounded-2xl border border-gold/20 bg-white px-4 py-4">
                <div className="flex items-start gap-3">
                  <BadgePercent className="mt-0.5 h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-dark">Wholesale available</p>
                    <p className="mt-1 text-sm text-charcoal/70">
                      {formatPrice(wholesalePrice)} per piece when you buy {wholesaleMinQty}+ pieces.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-gray-600">{product.description}</p>

          {wholesalePrice !== null && wholesaleMinQty !== null && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold/5 px-4 py-4 text-sm text-charcoal/80">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <p>
                {wholesaleActive
                  ? `Wholesale price is active for this quantity.`
                  : `Add at least ${wholesaleMinQty} pieces to unlock the wholesale rate.`}
              </p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSize(s.size)}
                  disabled={s.stock === 0}
                  className={`min-w-[3rem] border px-4 py-3 text-sm font-bold transition-colors ${
                    selectedSize === s.size
                      ? "border-gold bg-gold text-white"
                      : s.stock === 0
                        ? "cursor-not-allowed border-border text-gray-300 line-through"
                        : "border-border hover:border-gold"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
            {selectedSizeData && (
              <p className="mt-2 text-sm text-gray-500">
                {selectedSizeData.stock > 0 ? `${selectedSizeData.stock} in stock` : "Out of stock"}
              </p>
            )}
            {isOutOfStock && (
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Out of Stock</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-bold uppercase tracking-widest">Qty</span>
            <div className="flex items-center border border-border">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-light-gray">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-light-gray">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {quantityHint && <p className="mt-3 text-sm text-charcoal/70">{quantityHint}</p>}

          <motion.div className="mt-8" whileTap={{ scale: 0.98 }}>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isOutOfStock || !selectedSize || !selectedSizeData || selectedSizeData.stock === 0}
              onClick={handleAddToCart}
            >
              {added ? (
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5" /> Added to Cart
                </span>
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </Button>
          </motion.div>

          {product.reviews.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <h3 className="mb-6 font-display text-xl font-bold">Customer Reviews</h3>
              <div className="space-y-6">
                {product.reviews.slice(0, 5).map((review, i) => (
                  <div key={i} className="border-b border-border pb-6 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-gold text-gold" />
                        ))}
                      </div>
                      <span className="text-sm font-bold">{review.user.name}</span>
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
