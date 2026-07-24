import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency: "KES" | "USD" = "KES") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(currency === "KES" ? "en-KE" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(num);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JGK-${timestamp}-${random}`;
}

export function parseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [images];
  } catch {
    return images ? [images] : [];
  }
}

export function isNairobiLocation(city?: string | null, county?: string | null) {
  const text = `${city || ""} ${county || ""}`.toLowerCase();
  return text.includes("nairobi");
}

export function getKenyaShippingCost(city?: string | null, county?: string | null) {
  return isNairobiLocation(city, county) ? 0 : 300;
}

export function calculateUnitPrice(
  product: {
    price: number | string;
    wholesalePrice?: number | string | null;
    wholesaleMinQty?: number | null;
  },
  quantity: number
) {
  const retailPrice = Number(product.price);
  const wholesalePrice =
    product.wholesalePrice === null || product.wholesalePrice === undefined
      ? null
      : Number(product.wholesalePrice);
  const wholesaleMinQty = product.wholesaleMinQty ?? null;

  if (
    wholesalePrice !== null &&
    wholesaleMinQty !== null &&
    Number.isFinite(wholesalePrice) &&
    Number.isFinite(wholesaleMinQty) &&
    quantity >= wholesaleMinQty
  ) {
    return wholesalePrice;
  }

  return retailPrice;
}

export function calculateWholesaleSavings(
  product: {
    price: number | string;
    wholesalePrice?: number | string | null;
    wholesaleMinQty?: number | null;
  },
  quantity: number
) {
  const retailPrice = Number(product.price);
  const wholesalePrice =
    product.wholesalePrice === null || product.wholesalePrice === undefined
      ? null
      : Number(product.wholesalePrice);
  const wholesaleMinQty = product.wholesaleMinQty ?? null;

  if (
    wholesalePrice !== null &&
    wholesaleMinQty !== null &&
    Number.isFinite(wholesalePrice) &&
    Number.isFinite(wholesaleMinQty) &&
    quantity >= wholesaleMinQty
  ) {
    return Math.max(0, (retailPrice - wholesalePrice) * quantity);
  }

  return 0;
}
