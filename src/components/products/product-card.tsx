import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  compareAt?: number | null;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  badge?: "new" | "bestseller" | "featured" | null;
  stock?: number;
}

export function ProductCard({
  name,
  slug,
  price,
  image,
  compareAt,
  wholesalePrice,
  wholesaleMinQty,
  badge,
  stock,
}: ProductCardProps) {
  const outOfStock = typeof stock === "number" && stock <= 0;

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-light-gray">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-contain p-2 transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "grayscale" : ""}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {outOfStock && (
          <span className="absolute bottom-3 left-3 z-10 bg-charcoal px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
            Out of Stock
          </span>
        )}
        {badge && (
          <span className="absolute left-3 top-3 bg-charcoal px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
            {badge === "new" ? "New Arrival" : badge === "bestseller" ? "Best Seller" : "Featured"}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-charcoal transition-colors group-hover:text-gold">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-charcoal">{formatPrice(price)}</span>
          {compareAt && compareAt > price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(compareAt)}</span>
          )}
        </div>
        {wholesalePrice !== null && wholesalePrice !== undefined && wholesaleMinQty !== null && wholesaleMinQty !== undefined && (
          <p className="text-xs text-gold-dark">
            Wholesale {formatPrice(wholesalePrice)} at {wholesaleMinQty}+ pcs
          </p>
        )}
      </div>
    </Link>
  );
}
