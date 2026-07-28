"use client";

import { ToastViewport } from "@/components/ui/toast";
import { MiniCart } from "@/components/cart/mini-cart";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MiniCart />
      <ToastViewport />
    </>
  );
}
