import { create } from "zustand";
import api from "../services/axios";

export const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/users");
      set({ users: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createUser: async (data) => {
    try {
      const res = await api.post("/users", data);
      set({ users: [res.data, ...get().users] });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await api.put(`/users/${id}`, data);
      set({ users: get().users.map(u => u.user_id === id ? { ...u, ...res.data } : u) });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      set({ users: get().users.filter(u => u.user_id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));
