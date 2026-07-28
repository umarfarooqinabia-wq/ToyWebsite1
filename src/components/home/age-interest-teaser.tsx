import Link from "next/link";
import { AGE_RANGES, AUDIENCES } from "@/lib/commerce/age-interest";
import { Button } from "@/components/ui/button";

export function AgeInterestTeaser() {
  return (
    <section className="container-px mx-auto max-w-7xl py-8 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-bg-elevated to-surface px-5 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Age &amp; interest finder
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
              Shop the way parents actually decide
            </h2>
            <p className="mt-2 text-sm text-muted md:text-base">
              Pick an age range, then Boy / Girl / Both / Collector — no endless menus.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/find">
              <Button size="lg">Open finder</Button>
            </Link>
            <Link href="/gift-finder">
              <Button size="lg" variant="outline">
                Gift finder
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">
              Ages
            </p>
            <div className="flex flex-wrap gap-2">
              {AGE_RANGES.map((age) => (
                <Link
                  key={age.id}
                  href={`/find?age=${age.id}`}
                  className="rounded-xl border border-border bg-bg/60 px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
                >
                  {age.shortLabel}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">
              Interest
            </p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <Link
                  key={a.id}
                  href={`/find?audience=${a.id}`}
                  className="rounded-xl border border-border bg-bg/60 px-3 py-2 text-sm font-semibold text-text transition hover:border-secondary hover:text-secondary"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
