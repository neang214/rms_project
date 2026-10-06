import { create } from "zustand";
import api from "../services/axios";

export const useUnitStore = create((set, get) => ({
  units: [],
  isLoading: false,
  error: null,

  fetchUnits: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/units");
      set({ units: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createUnit: async (data) => {
    try {
      const res = await api.post("/units", data);
      set({ units: [...get().units, res.data] });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUnit: async (id) => {
    try {
      await api.delete(`/units/${id}`);
      set({ units: get().units.filter(u => u.unit_id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));
