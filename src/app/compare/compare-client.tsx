"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompareStore } from "@/store/compare";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { RatingStars } from "@/components/ui/rating-stars";
import { X } from "lucide-react";

export function CompareClient() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  if (items.length < 2) {
    return (
      <EmptyState
        title={items.length === 0 ? "No products to compare" : "Add one more product"}
        description="Select at least two products using the compare button on product cards."
        action={
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        }
      />
    );
  }

  const rows: { label: string; get: (i: (typeof items)[0]) => React.ReactNode }[] = [
    { label: "Price", get: (i) => formatMoney(i.price) },
    { label: "Brand", get: (i) => i.brand },
    { label: "Platform", get: (i) => i.platform.join(", ") || "—" },
    { label: "Compatibility", get: (i) => i.compatibility.join(", ") || "—" },
    {
      label: "Storage",
      get: (i) => i.specs.find((s) => s.label.toLowerCase().includes("storage"))?.value ?? "—",
    },
    { label: "Features", get: (i) => i.features.join(", ") || "—" },
    { label: "Rating", get: (i) => <RatingStars rating={i.rating} /> },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear all
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="p-4 text-left font-medium text-muted">Spec</th>
              {items.map((item) => (
                <th key={item.productId} className="min-w-[12rem] p-4 text-left">
                  <div className="relative mb-3 aspect-square w-28 overflow-hidden rounded-xl">
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="112px" />
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => remove(item.productId)}
                      className="absolute right-1 top-1 rounded-full bg-bg/80 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Link href={`/product/${item.handle}`} className="font-medium hover:text-accent">
                    {item.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="bg-surface/50 p-4 font-medium text-muted">{row.label}</td>
                {items.map((item) => (
                  <td key={item.productId} className="p-4 text-text">
                    {row.get(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
