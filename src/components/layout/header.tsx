"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { SearchBar } from "@/components/layout/search-bar";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeMenu } from "@/components/layout/theme-menu";
import { useCartStore, cartItemCount } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useThemeStore } from "@/store/theme";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/utils";

function IconAction({
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl text-muted transition duration-200",
        "hover:bg-surface-hover hover:text-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function IconLink({
  href,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link> & { children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl text-muted transition duration-200",
        "hover:bg-surface-hover hover:text-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const lines = useCartStore((s) => s.lines);
  const itemCount = cartItemCount(lines);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const theme = useThemeStore((s) => s.theme);
  const openMiniCart = useUiStore((s) => s.openMiniCart);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (!cancelled) setSignedIn(res.ok);
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const mobileDrawer =
    mounted && mobileOpen
      ? createPortal(
          <div className="fixed inset-0 z-[80] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="absolute inset-y-0 left-0 flex h-dvh w-[min(100%,20rem)] flex-col border-r border-border bg-bg-elevated shadow-2xl animate-fade-up"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent/40 via-accent/70 to-transparent"
                aria-hidden
              />
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-4">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-muted transition hover:bg-surface-hover hover:text-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3 pb-[calc(var(--bottom-nav-height)+1.5rem)]">
                {NAV_LINKS.map((link) => {
                  const active =
                    pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-xl px-3.5 py-3 text-base font-medium transition",
                        active
                          ? "bg-accent-dim text-accent"
                          : "text-text hover:bg-surface",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/toys-under-999"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-dim px-3.5 py-3 text-base font-semibold text-accent"
                >
                  Under Rs. 999
                </Link>
                <div className="mt-2 px-0.5">
                  <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-subtle">
                    Theme
                  </p>
                  <ThemeMenu fullWidth align="left" />
                </div>
              </nav>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-bg/85 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          : "bg-bg/55 backdrop-blur-xl",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent"
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity",
          scrolled ? "opacity-100" : "opacity-40",
          "bg-gradient-to-r from-transparent via-border to-transparent",
        )}
        aria-hidden
      />

      <div className="container-px mx-auto flex h-[var(--header-height)] max-w-7xl min-w-0 items-center gap-2 sm:gap-3 md:gap-5">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface/80 text-text transition hover:bg-surface-hover lg:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="min-w-0 max-[380px]:hidden">
          <BrandLogo priority size="md" />
        </span>
        <span className="min-[381px]:hidden">
          <BrandLogo priority size="sm" compact />
        </span>

        <div className="mx-auto hidden min-w-0 max-w-2xl flex-1 md:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="flex items-center rounded-2xl border border-border/70 bg-surface/50 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
            <ThemeMenu compact />
            <IconLink href="/account" aria-label="Account">
              <User className="h-4 w-4" />
            </IconLink>
            {mounted && !signedIn ? (
              <Link
                href="/account/login"
                className="hidden rounded-xl px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-surface-hover hover:text-accent sm:inline-flex"
              >
                Sign in
              </Link>
            ) : null}
            <IconLink href="/wishlist" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
              {mounted && wishlistCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white shadow-sm">
                  {wishlistCount}
                </span>
              ) : null}
            </IconLink>
            <IconAction
              aria-label="Open cart"
              onClick={openMiniCart}
              className="hover:text-accent"
            >
              <ShoppingCart className="h-4 w-4" />
              {mounted && itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-[var(--accent-fg)] shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_35%,transparent)]">
                  {itemCount}
                </span>
              ) : null}
            </IconAction>
          </div>
        </div>
      </div>

      <div className="container-px mx-auto block max-w-7xl pb-2 md:hidden">
        <SearchBar compact />
      </div>

      <nav className="hidden lg:block">
        <div className="container-px mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto py-2.5">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            const isDeal = link.href === "/toys-on-sale";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200",
                  active
                    ? "bg-accent-dim text-accent"
                    : "text-muted hover:bg-surface/80 hover:text-text",
                  isDeal && !active && "text-secondary hover:text-secondary",
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-accent transition duration-300",
                    active
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60",
                  )}
                />
              </Link>
            );
          })}
          <Link
            href="/toys-under-999"
            className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-accent/25 bg-accent-dim px-3.5 py-2 text-sm font-semibold text-accent transition hover:border-accent/50 hover:bg-accent/20"
          >
            Under Rs. 999
          </Link>
        </div>
      </nav>

      {mobileDrawer}
    </header>
  );
}
