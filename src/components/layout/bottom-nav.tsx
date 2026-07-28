"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Grid3X3, Home, PackageSearch, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, cartItemCount } from "@/store/cart";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Browse", icon: Grid3X3 },
  { href: "/track", label: "Track", icon: PackageSearch },
  { href: "/cart", label: "Cart", icon: ShoppingCart, badge: true },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const lines = useCartStore((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartItemCount(lines) : 0;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg/95 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex h-[var(--bottom-nav-height)] max-w-lg items-stretch justify-around px-2">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition",
                  active ? "text-accent" : "text-subtle hover:text-text",
                )}
              >
                <span className="relative">
                  <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                  {badge && count > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-[var(--accent-fg)]">
                      {count}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
