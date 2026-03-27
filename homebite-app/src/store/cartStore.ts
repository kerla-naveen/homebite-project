import { create } from 'zustand';

export interface CartFoodItem {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  vendor: { id: string; businessName: string };
}

export interface CartItem {
  id: string;
  foodItemId: string;
  quantity: number;
  foodItem: CartFoodItem;
}

interface CartState {
  items: CartItem[];
  vendorId: string | null;
  subtotal: number;
  isLoading: boolean;
  setCart: (items: CartItem[], vendorId: string | null, subtotal: number) => void;
  setLoading: (loading: boolean) => void;
  clearLocalCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  vendorId: null,
  subtotal: 0,
  isLoading: false,
  setCart: (items, vendorId, subtotal) => set({ items, vendorId, subtotal }),
  setLoading: (isLoading) => set({ isLoading }),
  clearLocalCart: () => set({ items: [], vendorId: null, subtotal: 0 }),
}));
