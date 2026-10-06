import { create } from "zustand";
import api from "../services/axios";

export const useTableStore = create((set, get) => ({
  tables: [],
  isLoading: false,
  error: null,

  fetchTables: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/tables");
      set({ tables: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  
  
  
  fetchTablesWithTokens: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/tables/admin/all");
      set({ tables: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  
  
  getTableByToken: async (token) => {
    try {
      const res = await api.get(`/tables/qr/${token}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  createTable: async (data) => {
    try {
      const res = await api.post("/tables", data);
      set({ tables: [...get().tables, res.data] });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateTable: async (id, data) => {
    try {
      const res = await api.put(`/tables/${id}`, data);
      set({ tables: get().tables.map(t => t.table_id === id ? { ...t, ...res.data } : t) });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  
  
  regenerateQrToken: async (id) => {
    try {
      const res = await api.patch(`/tables/${id}/regenerate-qr`);
      set({ tables: get().tables.map(t => t.table_id === id ? { ...t, ...res.data } : t) });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTable: async (id) => {
    try {
      await api.delete(`/tables/${id}`);
      set({ tables: get().tables.filter(t => t.table_id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));
