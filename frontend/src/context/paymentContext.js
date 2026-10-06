import { create } from "zustand";
import api from "../services/axios";

export const usePaymentStore = create((set, get) => ({
  payments: [],
  paymentMethods: [],
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/payments");
      set({ payments: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchPaymentMethods: async () => {
    try {
      const res = await api.get("/payment-methods");
      set({ paymentMethods: res.data });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getPaymentByOrder: async (orderId) => {
    try {
      const res = await api.get(`/payments/order/${orderId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  createPayment: async (data) => {
    try {
      const res = await api.post("/payments", data);
      set({ payments: [res.data, ...get().payments] });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updatePaymentStatus: async (id, status) => {
    try {
      const res = await api.patch(`/payments/${id}/status`, { status });
      set({ payments: get().payments.map(p => p.payment_id === id ? { ...p, ...res.data } : p) });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
}));
