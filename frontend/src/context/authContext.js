import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/axios";

const TAB_SESSION_KEY = "rms-tab-authenticated";

export const authContext = create(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,

            checkAuth: async () => {
                if (sessionStorage.getItem(TAB_SESSION_KEY) !== "true") {
                    set({ user: null, isLoading: false });
                    return;
                }

                if (!get().user) {
                    set({ isLoading: true });
                }

                try {
                    const res = await api.get("/auth/me");
                    const userData = res.data.user || res.data;
                    set({ user: userData, isLoading: false });
                } catch (error) {
                    console.error("Session verification sync failed:", error);
                    if (
                        error.response?.status === 401 ||
                        error.response?.status === 403
                    ) {
                        set({ user: null });
                    }
                    set({ isLoading: false });
                }
            },

            login: async (formData) => {
                set({ isLoading: true });
                try {
                    const res = await api.post("/auth/login", formData);
                    const userData = res.data.user || res.data;
                    
                    
                    
                    sessionStorage.setItem(TAB_SESSION_KEY, "true");
                    set({ user: userData, isLoading: false });
                } catch (error) {
                    console.error("Login failed:", error);
                    set({ user: null, isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.post("/auth/logout");
                } catch (err) {
                    console.error("Logout request error:", err);
                } finally {
                    sessionStorage.removeItem(TAB_SESSION_KEY);
                    set({ user: null });
                    localStorage.removeItem("rms-auth-storage");
                }
            },
        }),
        {
            name: "rms-auth-storage",
            
            
            
            
            
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ user: state.user }),
        },
    ),
);
