"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  AGE_RANGES,
  AUDIENCES,
  type AgeRangeId,
  type AudienceId,
} from "@/lib/commerce/age-interest";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AgeInterestPicker({
  age,
  audience,
  resultCount,
  compact = false,
}: {
  age?: string;
  audience?: string;
  resultCount?: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const selectedAge = age as AgeRangeId | undefined;
  const selectedAudience = audience as AudienceId | undefined;

  const push = (nextAge?: string, nextAudience?: string) => {
    const params = new URLSearchParams();
    if (nextAge) params.set("age", nextAge);
    if (nextAudience) params.set("audience", nextAudience);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/find?${qs}` : "/find");
    });
  };

  return (
    <div className={cn("space-y-8", pending && "opacity-80")}>
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold sm:text-xl">1. Shop by age</h2>
            <p className="mt-1 text-sm text-muted">Parents usually start here.</p>
          </div>
          {selectedAge ? (
            <button
              type="button"
              onClick={() => push(undefined, selectedAudience)}
              className="text-xs font-medium text-accent hover:underline"
            >
              Clear age
            </button>
          ) : null}
        </div>
        <div
          className={cn(
            "grid gap-2.5",
            compact ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
          )}
        >
          {AGE_RANGES.map((range) => {
            const active = selectedAge === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() =>
                  push(active ? undefined : range.id, selectedAudience)
                }
                className={cn(
                  "rounded-2xl border px-3 py-4 text-left transition",
                  active
                    ? "border-accent bg-accent-dim shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_18%,transparent)]"
                    : "border-border bg-surface/80 hover:border-accent/40 hover:bg-surface",
                )}
              >
                <span className="font-display text-base font-bold text-text sm:text-lg">
                  {range.shortLabel}
                </span>
                <span className="mt-1 block text-xs leading-snug text-muted">
                  {range.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold sm:text-xl">2. Interest</h2>
            <p className="mt-1 text-sm text-muted">Who is this toy for?</p>
          </div>
          {selectedAudience ? (
            <button
              type="button"
              onClick={() => push(selectedAge, undefined)}
              className="text-xs font-medium text-accent hover:underline"
            >
              Clear interest
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {AUDIENCES.map((item) => {
            const active = selectedAudience === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  push(selectedAge, active ? undefined : item.id)
                }
                className={cn(
                  "rounded-2xl border px-3 py-4 text-left transition",
                  active
                    ? "border-secondary bg-secondary-dim"
                    : "border-border bg-surface/80 hover:border-secondary/40 hover:bg-surface",
                )}
              >
                <span className="font-display text-base font-bold text-text">{item.label}</span>
                <span className="mt-1 block text-xs leading-snug text-muted">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {(selectedAge || selectedAudience) && typeof resultCount === "number" ? (
        <p className="text-sm text-muted">
          Showing <span className="font-semibold text-text">{resultCount}</span> matching toys
          {pending ? "…" : ""}
        </p>
      ) : null}

      {!selectedAge && !selectedAudience ? (
        <div className="flex flex-wrap gap-3">
          <Link href="/find?age=3-5&audience=both">
            <Button variant="outline" size="sm">
              Try: Ages 3–5 · Both
            </Button>
          </Link>
          <Link href="/find?age=6-8&audience=boy">
            <Button variant="outline" size="sm">
              Try: Ages 6–8 · Boy
            </Button>
          </Link>
          <Link href="/find?audience=collector">
            <Button variant="outline" size="sm">
              Try: Collector diecast
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
