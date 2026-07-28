import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import {
  filterUpcomingReleases,
  formatReleaseDate,
} from "@/lib/commerce/release-calendar";

export function ReleaseCalendarTeaser() {
  const upcoming = filterUpcomingReleases({ period: "all" }).slice(0, 4);

  if (!upcoming.length) return null;

  return (
    <section className="container-px mx-auto max-w-7xl py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Never miss a launch
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold md:text-3xl">
            Game Release Calendar
          </h2>
          <p className="mt-2 text-muted">
            Upcoming PS5, Xbox, and Switch titles with dates and pre-order links.
          </p>
        </div>
        <Link
          href="/release-calendar"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
        >
          Full calendar
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {upcoming.map((game) => (
          <Link
            key={game.id}
            href="/release-calendar"
            className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/40"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-bg">
              <Image
                src={game.coverImage}
                alt={game.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 25vw"
              />
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                {game.platforms.join(" · ")}
              </p>
              <h3 className="font-display mt-1 line-clamp-2 text-base font-bold text-text">
                {game.title}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <CalendarDays className="h-3.5 w-3.5 text-accent" />
                {formatReleaseDate(game.releaseDate)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
