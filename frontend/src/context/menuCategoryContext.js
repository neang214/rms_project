import { create } from "zustand";
import api from "../services/axios";

export const useMenuCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/menu-categories");
      set({ categories: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      const res = await api.post("/menu-categories", data);
      set({ categories: [...get().categories, res.data] });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const res = await api.put(`/menu-categories/${id}`, data);
      set({ categories: get().categories.map(c => c.category_id === id ? { ...c, ...data } : c) });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/menu-categories/${id}`);
      set({ categories: get().categories.filter(c => c.category_id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));
