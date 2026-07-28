"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";

const QUICK_LINKS = [
  { href: "/products", label: "All toys" },
  { href: "/remote-control", label: "Remote control" },
  { href: "/educational-toys", label: "Educational" },
  { href: "/toys-for-boys", label: "Boys" },
  { href: "/toys-for-girls", label: "Girls" },
  { href: "/deals", label: "Deals" },
  { href: "/", label: "Home" },
] as const;

/**
 * Friendly recovery screen — auto-sends shoppers to the catalog so a
 * raw dead-end 404 is never the lasting experience.
 */
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace("/products");
    }, 1800);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="container-px mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <BrandLogo />
      <h1 className="mt-8 font-display text-2xl font-bold md:text-3xl">
        Taking you back to the shop
      </h1>
      <p className="mt-2 text-sm text-muted">
        That page is missing or outdated. Redirecting to products — or pick a destination
        below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {QUICK_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
