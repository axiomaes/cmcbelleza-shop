"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { useEffect, useState } from "react";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          );
          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += newItem.quantity;
            return { items: newItems };
          }
          return { items: [...state.items, newItem] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
    }),
    {
      name: "cmc-belleza-cart",
    }
  )
);

/**
 * Hook seguro para usar en componentes con hidratación de LocalStorage
 */
export function useCart() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const store = useCartStore();

  if (!mounted) {
    return {
      items: [],
      isOpen: false,
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      toggleCart: () => {},
    };
  }

  return store;
}
