"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-full">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="min-w-0 flex-1 overflow-x-clip pb-[calc(var(--bottom-nav-height)+0.5rem)] lg:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <WhatsAppFloat />
    </>
  );
}
