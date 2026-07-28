"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, LayoutDashboard, LogOut, Newspaper, Users } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { ADMIN_PUBLIC } from "@/lib/admin/public";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/stock", label: "Toy Stock", icon: Package },
  { href: "/admin/content", label: "CMS & SEO", icon: Newspaper },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  if (isLogin) return <>{children}</>;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(0,212,170,0.08),_transparent_55%),var(--color-bg)]">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <BrandLogo />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold">Admin Console</p>
            <p className="truncate text-xs text-muted">{ADMIN_PUBLIC.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted transition hover:border-accent hover:text-accent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-accent text-[#04110e]"
                    : "text-muted hover:bg-surface hover:text-text",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
