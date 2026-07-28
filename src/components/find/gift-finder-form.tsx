"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AGE_RANGES } from "@/lib/commerce/age-interest";
import {
  BUDGET_PRESETS,
  GIFT_OCCASIONS,
} from "@/lib/commerce/gift-finder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GiftFinderForm({
  initialAge,
  initialOccasion,
  initialMin,
  initialMax,
  resultCount,
}: {
  initialAge?: string;
  initialOccasion?: string;
  initialMin?: number;
  initialMax?: number;
  resultCount?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [age, setAge] = useState(initialAge ?? "");
  const [occasion, setOccasion] = useState(initialOccasion ?? "");
  const [minBudget, setMinBudget] = useState(initialMin ?? 0);
  const [maxBudget, setMaxBudget] = useState(initialMax ?? 10000);

  const activePreset = useMemo(
    () =>
      BUDGET_PRESETS.find((p) => p.min === minBudget && p.max === maxBudget)?.label,
    [minBudget, maxBudget],
  );

  const apply = () => {
    const params = new URLSearchParams();
    if (age) params.set("age", age);
    if (occasion) params.set("occasion", occasion);
    if (minBudget > 0) params.set("minPrice", String(minBudget));
    if (maxBudget > 0) params.set("maxPrice", String(maxBudget));
    startTransition(() => {
      router.push(`/gift-finder?${params.toString()}`);
    });
  };

  return (
    <div className={cn("space-y-8", pending && "opacity-80")}>
      <section>
        <h2 className="font-display text-lg font-bold sm:text-xl">Occasion</h2>
        <p className="mt-1 text-sm text-muted">What are you shopping for?</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {GIFT_OCCASIONS.map((item) => {
            const active = occasion === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOccasion(active ? "" : item.id);
                  if (!active && item.suggestedMax) {
                    setMinBudget(0);
                    setMaxBudget(item.suggestedMax);
                  }
                }}
                className={cn(
                  "rounded-2xl border px-3 py-4 text-left transition",
                  active
                    ? "border-accent bg-accent-dim"
                    : "border-border bg-surface/80 hover:border-accent/40",
                )}
              >
                <span className="font-display text-sm font-bold text-text sm:text-base">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs text-muted">{item.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold sm:text-xl">Age</h2>
        <p className="mt-1 text-sm text-muted">Who will open the gift?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AGE_RANGES.map((range) => {
            const active = age === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => setAge(active ? "" : range.id)}
                className={cn(
                  "rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition",
                  active
                    ? "border-secondary bg-secondary-dim text-text"
                    : "border-border bg-surface/80 text-muted hover:border-secondary/40 hover:text-text",
                )}
              >
                {range.shortLabel}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold sm:text-xl">Budget (PKR)</h2>
            <p className="mt-1 text-sm text-muted">
              {minBudget.toLocaleString("en-PK")} – {maxBudget.toLocaleString("en-PK")}
              {activePreset ? ` · ${activePreset}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const active = minBudget === preset.min && maxBudget === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setMinBudget(preset.min);
                  setMaxBudget(preset.max);
                }}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-accent bg-accent-dim text-accent"
                    : "border-border text-muted hover:border-accent/40 hover:text-text",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-muted">
            Min
            <input
              type="range"
              min={0}
              max={50000}
              step={500}
              value={Math.min(minBudget, maxBudget)}
              onChange={(e) => setMinBudget(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </label>
          <label className="block text-sm text-muted">
            Max
            <input
              type="range"
              min={500}
              max={100000}
              step={500}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={apply} loading={pending}>
          Find gift ideas
        </Button>
        {typeof resultCount === "number" && (initialAge || initialOccasion || initialMax) ? (
          <p className="text-sm text-muted">
            <span className="font-semibold text-text">{resultCount}</span> gifts in range
          </p>
        ) : null}
      </div>
    </div>
  );
}
