import { create } from "zustand";
import api from "../services/axios";

export const useStockOrderStore = create((set, get) => ({
  stockOrders: [],
  isLoading: false,
  error: null,

  fetchStockOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/stock-orders");
      set({ stockOrders: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createStockOrder: async (data) => {
    try {
      const res = await api.post("/stock-orders", data);
      set({ stockOrders: [...get().stockOrders, res.data] });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await api.patch(`/stock-orders/${id}/status`, { status });
      await get().fetchStockOrders();
      return res.data;
    } catch (error) {
      throw error;
    }
  },
}));
