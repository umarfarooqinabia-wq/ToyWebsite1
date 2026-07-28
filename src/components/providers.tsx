"use client";

import { useEffect } from "react";
import { ToastViewport } from "@/components/ui/toast";
import { MiniCart } from "@/components/cart/mini-cart";
import { useThemeStore } from "@/store/theme";

/** Keeps <html data-theme> in sync on every route (including /admin). */
function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Apply persisted theme as soon as zustand rehydrates from localStorage.
    const unsub = useThemeStore.persist.onFinishHydration((state) => {
      document.documentElement.setAttribute("data-theme", state.theme);
    });
    if (useThemeStore.persist.hasHydrated()) {
      document.documentElement.setAttribute(
        "data-theme",
        useThemeStore.getState().theme,
      );
    }
    return unsub;
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeSync />
      {children}
      <MiniCart />
      <ToastViewport />
    </>
  );
}
