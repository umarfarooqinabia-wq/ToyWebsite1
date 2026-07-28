"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { BRAND_OPTIONS, PLATFORM_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

function useCatalogParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    values[k] = v;
  });

  const pushParams = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return { values, pushParams, pathname, router };
}

function PriceRangeFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (patch: Record<string, string>) => void;
}) {
  const [min, setMin] = useState(values.minPrice ?? "");
  const [max, setMax] = useState(values.maxPrice ?? "");

  useEffect(() => {
    setMin(values.minPrice ?? "");
    setMax(values.maxPrice ?? "");
  }, [values.minPrice, values.maxPrice]);

  const commit = () => {
    const patch: Record<string, string> = {};
    if (min !== (values.minPrice ?? "")) patch.minPrice = min;
    if (max !== (values.maxPrice ?? "")) patch.maxPrice = max;
    if (Object.keys(patch).length) onChange(patch);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-text">Price range (PKR)</p>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
        />
        <Input
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
        />
      </div>
    </div>
  );
}

function FilterFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (patch: Record<string, string>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-text">Platform</p>
        <div className="space-y-2">
          {PLATFORM_OPTIONS.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={(values.platform ?? "").split(",").filter(Boolean).includes(p)}
                onChange={(e) => {
                  const current = (values.platform ?? "").split(",").filter(Boolean);
                  const next = e.target.checked
                    ? [...current, p]
                    : current.filter((x) => x !== p);
                  onChange({ platform: next.join(",") });
                }}
                className="accent-[var(--accent)]"
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text">Brand</p>
        <div className="space-y-2">
          {BRAND_OPTIONS.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={(values.brand ?? "").split(",").filter(Boolean).includes(b)}
                onChange={(e) => {
                  const current = (values.brand ?? "").split(",").filter(Boolean);
                  const next = e.target.checked
                    ? [...current, b]
                    : current.filter((x) => x !== b);
                  onChange({ brand: next.join(",") });
                }}
                className="accent-[var(--accent)]"
              />
              {b}
            </label>
          ))}
        </div>
      </div>

      <PriceRangeFields values={values} onChange={onChange} />

      <div>
        <p className="mb-2 text-sm font-semibold text-text">Condition</p>
        {(["new", "pre-owned", "refurbished"] as const).map((c) => (
          <label key={c} className="mb-2 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={(values.condition ?? "").split(",").filter(Boolean).includes(c)}
              onChange={(e) => {
                const current = (values.condition ?? "").split(",").filter(Boolean);
                const next = e.target.checked
                  ? [...current, c]
                  : current.filter((x) => x !== c);
                onChange({ condition: next.join(",") });
              }}
              className="accent-[var(--accent)]"
            />
            {c === "pre-owned" ? "Used" : c === "refurbished" ? "Refurbished" : "New"}
          </label>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text">Rating</p>
        <Select
          value={values.minRating ?? ""}
          onChange={(e) => onChange({ minRating: e.target.value })}
        >
          <option value="">Any</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </Select>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text">Availability</p>
        <Select
          value={values.availability ?? "all"}
          onChange={(e) =>
            onChange({ availability: e.target.value === "all" ? "" : e.target.value })
          }
        >
          <option value="all">All</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={values.discount === "1"}
          onChange={(e) => onChange({ discount: e.target.checked ? "1" : "" })}
          className="accent-[var(--accent)]"
        />
        On discount
      </label>
    </div>
  );
}

export function CatalogSidebar() {
  const { values, pushParams, pathname, router } = useCatalogParams();
  return (
    <div className="sticky top-28 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display font-semibold">Filters</h2>
        <button
          type="button"
          className="text-xs text-accent"
          onClick={() => router.push(pathname)}
        >
          Reset
        </button>
      </div>
      <FilterFields values={values} onChange={pushParams} />
    </div>
  );
}

export function CatalogToolbar({ total }: { total: number }) {
  const { values, pushParams, pathname, router } = useCatalogParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const chips: { key: string; label: string; clear: () => void }[] = [];
  (values.platform ?? "")
    .split(",")
    .filter(Boolean)
    .forEach((p) =>
      chips.push({
        key: `platform-${p}`,
        label: p,
        clear: () => {
          const next = (values.platform ?? "")
            .split(",")
            .filter((x) => x && x !== p)
            .join(",");
          pushParams({ platform: next });
        },
      }),
    );
  (values.brand ?? "")
    .split(",")
    .filter(Boolean)
    .forEach((b) =>
      chips.push({
        key: `brand-${b}`,
        label: b,
        clear: () => {
          const next = (values.brand ?? "")
            .split(",")
            .filter((x) => x && x !== b)
            .join(",");
          pushParams({ brand: next });
        },
      }),
    );
  if (values.minPrice || values.maxPrice) {
    chips.push({
      key: "price",
      label: `Rs. ${values.minPrice || "0"}–${values.maxPrice || "∞"}`,
      clear: () => pushParams({ minPrice: "", maxPrice: "" }),
    });
  }
  (values.condition ?? "")
    .split(",")
    .filter(Boolean)
    .forEach((c) =>
      chips.push({
        key: `condition-${c}`,
        label: c === "pre-owned" ? "Used" : c === "refurbished" ? "Refurbished" : "New",
        clear: () => {
          const next = (values.condition ?? "")
            .split(",")
            .filter((x) => x && x !== c)
            .join(",");
          pushParams({ condition: next });
        },
      }),
    );
  if (values.discount === "1") {
    chips.push({
      key: "discount",
      label: "On discount",
      clear: () => pushParams({ discount: "" }),
    });
  }
  if (values.minRating) {
    chips.push({
      key: "rating",
      label: `${values.minRating}+ stars`,
      clear: () => pushParams({ minRating: "" }),
    });
  }
  if (values.availability === "in_stock" || values.availability === "out_of_stock") {
    chips.push({
      key: "availability",
      label: values.availability === "in_stock" ? "In stock" : "Out of stock",
      clear: () => pushParams({ availability: "" }),
    });
  }

  return (
    <>
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="shrink-0 text-sm text-muted">{total} products</p>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Select
            className="min-w-0 flex-1 basis-[10rem] sm:w-48 sm:flex-none"
            value={values.sort ?? "featured"}
            onChange={(e) => pushParams({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="mb-4 flex min-w-0 flex-wrap items-center gap-2 sm:mb-6">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent/30 bg-accent-dim px-3 py-1 text-xs font-medium text-accent"
            >
              <span className="truncate">{chip.label}</span>
              <X className="h-3 w-3 shrink-0" />
            </button>
          ))}
          <button
            type="button"
            className="text-xs text-muted hover:text-accent"
            onClick={() => router.push(pathname)}
          >
            Clear all
          </button>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-bg-elevated shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl border border-border p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-[calc(var(--bottom-nav-height)+5rem)]">
              <FilterFields values={values} onChange={pushParams} />
            </div>
            <div className="shrink-0 border-t border-border bg-bg-elevated p-4 pb-[calc(var(--bottom-nav-height)+0.75rem)] sm:pb-4">
              <Button className="w-full" onClick={() => setDrawerOpen(false)}>
                Show results
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
