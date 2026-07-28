"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCompareStore } from "@/store/compare";
import { Button } from "@/components/ui/button";

export function CompareFloatingBar() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+0.75rem)] z-40 mx-auto w-[min(100%-1.5rem,56rem)] rounded-2xl border border-border bg-bg-elevated/95 p-3 shadow-[var(--shadow)] backdrop-blur-xl lg:bottom-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {items.map((item) => (
            <div
              key={item.productId}
              className="relative flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5"
            >
              <span className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image src={item.image} alt="" fill className="object-cover" sizes="32px" />
              </span>
              <span className="max-w-[7rem] truncate text-xs">{item.title}</span>
              <button
                type="button"
                aria-label="Remove from compare"
                onClick={() => remove(item.productId)}
                className="text-subtle hover:text-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={clear} className="text-xs text-muted hover:text-text">
            Clear
          </button>
          <Link href="/compare">
            <Button size="sm">Compare ({items.length})</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
