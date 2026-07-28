import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PakistanCodBanner() {
  return (
    <section className="container-px mx-auto max-w-7xl py-6">
      <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-r from-surface via-bg-elevated to-surface px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-36 w-36 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Built for Pakistani families
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
              COD available. Quality toys. Nationwide delivery.
            </h2>
            <p className="mt-2 text-sm text-muted md:text-base">
              Shop diecast, RC, baby gear and summer pools with Cash on Delivery or bank transfer —
              from Karachi to your doorstep.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/products">
              <Button size="lg">Shop All Toys</Button>
            </Link>
            <Link href="/toys-on-sale">
              <Button size="lg" variant="outline">
                View Sale
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
