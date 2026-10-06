import { create } from "zustand";
import clientApi from '../services/axios';

export const useDashboardStore = create((set) => ({
    dailyRevenue: null,
    weeklyRevenue: null,
    monthlyRevenue: null,

    topSellingItems: [],
    
    isLoading: false,
    error: null,

    
    fetchDailyRevenue: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await clientApi.get('/analytics/revenue/daily');
            set({ dailyRevenue: res.data, isLoading: false });
            return res.data;
        } catch (error) {
            set({ error: error.message || "Failed to fetch daily revenue", isLoading: false });
            throw error;
        }
    },

    
    fetchWeeklyRevenue: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await clientApi.get('/analytics/revenue/weekly'); 
            set({ weeklyRevenue: res.data, isLoading: false });
            return res.data;
        } catch (error) {
            set({ error: error.message || "Failed to fetch weekly revenue", isLoading: false });
            throw error;
        }
    },

    
    fetchMonthlyRevenue: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await clientApi.get('/analytics/revenue/monthly'); 
            set({ monthlyRevenue: res.data, isLoading: false });
            return res.data;
        } catch (error) {
            set({ error: error.message || "Failed to fetch monthly revenue", isLoading: false });
            throw error;
        }
    },

    fetchTopSelling: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await clientApi.get('/analytics/menu/top-selling');
            set({ topSellingItems: res.data, isLoading: false });
            return res.data;
        } catch (error) {
            set({ error: error.message || "Failed to fetch top selling items", isLoading: false });
            throw error;
        }
    }
}));