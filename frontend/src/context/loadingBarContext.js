import { create } from "zustand"

export const useLoadingBarStore = create((set, get) => ({
  activeCount: 0,
  start: () => set({ activeCount: get().activeCount + 1 }),
  stop: () => set({ activeCount: Math.max(0, get().activeCount - 1) }),
}))
