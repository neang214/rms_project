import { create } from "zustand";
import api from "../services/axios";

export const useOrderItemStore = create((set, get) => ({
  kitchenQueue: [],
  baristaQueue: [],
  isLoading: false,
  error: null,

  fetchKitchenQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/order-items/queue/kitchen");
      set({ kitchenQueue: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchBaristaQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/order-items/queue/barista");
      set({ baristaQueue: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getItemsByOrder: async (orderId) => {
    try {
      const res = await api.get(`/order-items/${orderId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  addItem: async (data) => {
    try {
      const res = await api.post("/order-items", data);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateItemStatus: async (id, status) => {
    try {
      const res = await api.patch(`/order-items/${id}/status`, { status });
      
      set({
        kitchenQueue: get().kitchenQueue.map(i => i.order_item_id === id ? { ...i, status } : i),
        baristaQueue: get().baristaQueue.map(i => i.order_item_id === id ? { ...i, status } : i),
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateItemNote: async (id, note) => {
    try {
      const res = await api.patch(`/order-items/${id}/note`, { note });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      await api.delete(`/order-items/${id}`);
    } catch (error) {
      throw error;
    }
  },
}));
