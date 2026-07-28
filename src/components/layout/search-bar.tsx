"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SearchSuggestion } from "@/types/commerce";
import { cn } from "@/lib/utils";

export function SearchBar({ className, compact }: { className?: string; compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
          });
          if (res.ok) {
            const data = (await res.json()) as SearchSuggestion[];
            setSuggestions(data);
            setOpen(true);
          }
        } catch {
          /* aborted */
        }
      });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} className="group relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle transition group-focus-within:text-accent" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder={compact ? "Search toys..." : "Search diecast, RC, dolls, pools..."}
          className={cn(
            "h-11 w-full rounded-2xl border border-border/80 bg-surface/70 pl-11 text-sm text-text",
            compact ? "pr-11" : "pr-24",
            "placeholder:text-subtle outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm",
            "transition duration-200",
            "hover:border-border-strong hover:bg-surface",
            "focus:border-accent/60 focus:bg-surface focus:ring-2 focus:ring-accent/20",
          )}
          aria-label="Search products"
          autoComplete="off"
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-subtle transition hover:bg-surface-hover hover:text-text"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          {!compact ? (
            <button
              type="submit"
              className="hidden h-8 items-center rounded-xl bg-accent px-3 text-xs font-semibold text-[var(--accent-fg)] transition hover:bg-accent-hover sm:inline-flex"
            >
              Search
            </button>
          ) : null}
        </div>
      </form>

      {open && (suggestions.length > 0 || pending) ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border/80 bg-bg-elevated/95 shadow-[var(--shadow)] backdrop-blur-xl">
          <ul className="max-h-80 overflow-auto py-2">
            {suggestions.map((s) => (
              <li key={`${s.type}-${s.href}-${s.label}`}>
                <Link
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-surface"
                >
                  {s.image ? (
                    <span className="relative h-10 w-10 overflow-hidden rounded-lg bg-surface">
                      <Image src={s.image} alt="" fill className="object-cover" sizes="40px" />
                    </span>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-dim text-xs font-semibold uppercase text-accent">
                      {s.type.slice(0, 3)}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm text-text">{s.label}</span>
                    <span className="text-xs capitalize text-subtle">{s.type}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
            className="w-full border-t border-border px-4 py-3 text-left text-sm font-medium text-accent hover:bg-surface"
          >
            View all results for “{query}”
          </button>
        </div>
      ) : null}
    </div>
  );
}
