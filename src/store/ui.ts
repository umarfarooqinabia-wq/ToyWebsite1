"use client";

import { create } from "zustand";

interface UiState {
  miniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  miniCartOpen: false,
  openMiniCart: () => set({ miniCartOpen: true }),
  closeMiniCart: () => set({ miniCartOpen: false }),
  toggleMiniCart: () => set((s) => ({ miniCartOpen: !s.miniCartOpen })),
}));
