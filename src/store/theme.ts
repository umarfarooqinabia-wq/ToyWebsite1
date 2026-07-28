"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme =
  | "dark"
  | "light"
  | "sepia"
  | "ocean"
  | "forest"
  | "crimson"
  | "cyber"
  | "sunset"
  | "oled";

export const THEME_ORDER: Theme[] = [
  "dark",
  "light",
  "sepia",
  "ocean",
  "forest",
  "crimson",
  "cyber",
  "sunset",
  "oled",
];

export const THEME_LABELS: Record<Theme, string> = {
  dark: "Dark",
  light: "Light",
  sepia: "Sepia / Retro",
  ocean: "Ocean Blue",
  forest: "Forest Green",
  crimson: "Crimson Red",
  cyber: "Cyber Silver",
  sunset: "Sunset",
  oled: "OLED Black",
};

export const THEME_DESCRIPTIONS: Record<Theme, string> = {
  dark: "Deep navy toys night",
  light: "Bright summer storefront",
  sepia: "Warm cream & gold retro",
  ocean: "Navy depths with cyan",
  forest: "Deep greens with lime accents",
  crimson: "Black & blood-red action",
  cyber: "Silver console with electric blue",
  sunset: "Orange, purple & pink dusk",
  oled: "True black for AMOLED screens",
};

/** Preview swatches for the theme picker UI */
export const THEME_SWATCHES: Record<Theme, [string, string, string]> = {
  dark: ["#07131a", "#122633", "#2ec4db"],
  light: ["#f7fafc", "#ffffff", "#1aa6c1"],
  sepia: ["#f3e6d0", "#efe0c6", "#c9a227"],
  ocean: ["#06101c", "#0c1a2e", "#22d3ee"],
  forest: ["#06140c", "#0f2418", "#84cc16"],
  crimson: ["#0a0506", "#1a0a0e", "#e11d48"],
  cyber: ["#0c0e12", "#1a1d24", "#3b82f6"],
  sunset: ["#0b0a1a", "#1a1030", "#f97316"],
  oled: ["#000000", "#0a0a0a", "#f8fafc"],
};

const VALID_THEMES = new Set<Theme>(THEME_ORDER);

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

function nextTheme(current: Theme): Theme {
  const idx = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(idx + 1) % THEME_ORDER.length] ?? "dark";
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && VALID_THEMES.has(value as Theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggle: () => set({ theme: nextTheme(get().theme) }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "toycompany-theme",
      merge: (persisted, current) => {
        const raw = persisted as Partial<ThemeState> | undefined;
        const theme = isTheme(raw?.theme) ? raw.theme : current.theme;
        return { ...current, ...raw, theme };
      },
    },
  ),
);
