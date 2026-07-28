"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Gamepad2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PERIOD_FILTERS,
  PLATFORM_FILTERS,
  filterUpcomingReleases,
  formatReleaseDate,
  getPreorderHref,
  groupReleasesByMonth,
  isExternalPreorder,
  type ReleasePeriodFilter,
  type ReleasePlatform,
  type UpcomingRelease,
} from "@/lib/commerce/release-calendar";

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3.5 py-2 text-sm font-medium transition",
        active
          ? "border-accent/40 bg-accent-dim text-accent"
          : "border-border text-muted hover:border-border-strong hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

function ReleaseRow({ release }: { release: UpcomingRelease }) {
  const href = getPreorderHref(release);
  const external = isExternalPreorder(href);
  const date = formatReleaseDate(release.releaseDate);

  return (
    <article className="grid gap-4 rounded-2xl border border-border bg-surface/60 p-4 transition hover:border-accent/35 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-bg sm:aspect-square sm:h-28 sm:w-28">
        <Image
          src={release.coverImage}
          alt=""
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {release.platforms.map((p) => (
            <span
              key={p}
              className="rounded-lg border border-border bg-bg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
            >
              {p}
            </span>
          ))}
          <span className="rounded-lg bg-accent-dim px-2 py-0.5 text-[11px] font-semibold text-accent">
            {release.genre}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold text-text sm:text-xl">{release.title}</h3>
        <p className="mt-1 text-sm text-muted">{release.blurb}</p>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-text">
          <CalendarDays className="h-4 w-4 text-accent" />
          {date}
          <span className="text-subtle">· {release.publisher}</span>
        </p>
      </div>
      <div className="sm:justify-self-end">
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Button className="w-full sm:w-auto">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Pre-order
            </Button>
          </a>
        ) : (
          <Link href={href}>
            <Button className="w-full sm:w-auto">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Pre-order
            </Button>
          </Link>
        )}
      </div>
    </article>
  );
}

export function ReleaseCalendarClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const period = (searchParams.get("period") as ReleasePeriodFilter) || "all";
  const platform = (searchParams.get("platform") as ReleasePlatform) || "";

  const releases = useMemo(
    () =>
      filterUpcomingReleases({
        period,
        platform: platform || null,
      }),
    [period, platform],
  );

  const groups = useMemo(() => groupReleasesByMonth(releases), [releases]);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-bg-elevated/70 p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
          <Gamepad2 className="h-4 w-4 text-accent" />
          Filter by period
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              active={period === f.id}
              onClick={() => setParam("period", f.id === "all" ? null : f.id)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>

        <div className="mb-4 mt-6 flex items-center gap-2 text-sm font-semibold text-text">
          <Gamepad2 className="h-4 w-4 text-accent" />
          Filter by platform
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!platform} onClick={() => setParam("platform", null)}>
            All platforms
          </FilterChip>
          {PLATFORM_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              active={platform === f.id}
              onClick={() => setParam("platform", platform === f.id ? null : f.id)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted">
        Showing <span className="font-semibold text-text">{releases.length}</span> upcoming
        release{releases.length === 1 ? "" : "s"}
        {platform ? (
          <>
            {" "}
            on <span className="font-semibold text-text">{platform}</span>
          </>
        ) : null}
        .
      </p>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-text">No releases match</p>
          <p className="mt-2 text-sm text-muted">
            Try another month or platform — or WhatsApp us to request a title.
          </p>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => {
              setParam("period", null);
              setParam("platform", null);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(([month, items]) => (
            <section key={month}>
              <h2 className="font-display mb-4 text-xl font-bold text-text md:text-2xl">
                {month}
              </h2>
              <div className="space-y-3">
                {items.map((release) => (
                  <ReleaseRow key={release.id} release={release} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
