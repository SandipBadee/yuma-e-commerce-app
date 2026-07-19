import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  error: '',

  setOrders: (orders) => set({ orders: Array.isArray(orders) ? orders : [] }),
  setLoading: (loading) => set({ loading: Boolean(loading) }),
  setError: (error) => set({ error: String(error || '') }),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),
}));
