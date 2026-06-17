"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CART_KEY = "jkg-cart";
const listeners = new Set<() => void>();
const EMPTY_CART: CartItem[] = [];
let cartCache: CartItem[] | null = null;
let cartHydrated = false;

function loadCart(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  if (cartHydrated && cartCache) {
    return cartCache;
  }

  cartHydrated = true;

  try {
    const saved = localStorage.getItem(CART_KEY);
    cartCache = saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    cartCache = [];
  }

  return cartCache;
}

function getCartSnapshot() {
  return loadCart();
}

function writeCart(items: CartItem[]) {
  cartCache = items;
  cartHydrated = true;

  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  listeners.forEach((listener) => listener());
}

function subscribeCart(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_KEY) {
      cartHydrated = false;
      cartCache = null;
      listener();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, () => EMPTY_CART);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const next = loadCart();
      const existing = next.find((i) => i.productId === item.productId && i.size === item.size);

      if (existing) {
        writeCart(
          next.map((i) =>
            i.productId === item.productId && i.size === item.size
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          )
        );
        return;
      }

      writeCart([...next, { ...item, quantity: item.quantity ?? 1 }]);
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string) => {
    writeCart(loadCart().filter((i) => !(i.productId === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size);
        return;
      }

      writeCart(
        loadCart().map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => writeCart([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
