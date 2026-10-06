import { create } from "zustand";
import api from "../services/axios";

export const useSupplierStore = create((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/suppliers");
      set({ suppliers: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createSupplier: async (data) => {
    try {
      const res = await api.post("/suppliers", data);
      set({ suppliers: [...get().suppliers, res.data] });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateSupplier: async (id, data) => {
    try {
      const res = await api.put(`/suppliers/${id}`, data);
      set({ suppliers: get().suppliers.map(s => s.supplier_id === id ? { ...s, ...res.data } : s) });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    try {
      await api.delete(`/suppliers/${id}`);
      set({ suppliers: get().suppliers.filter(s => s.supplier_id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));
