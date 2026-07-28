import type { Product } from "@/types/commerce";
import { getGameDetailSpecs } from "@/lib/commerce/game-details";

export function GameDetailsPanel({ product }: { product: Product }) {
  const details = getGameDetailSpecs(product);
  if (details.length === 0) return null;

  return (
    <section
      aria-labelledby="game-details-heading"
      className="mt-6 rounded-2xl border border-border bg-bg/60 p-4 sm:p-5"
    >
      <h2
        id="game-details-heading"
        className="font-display text-sm font-semibold uppercase tracking-wider text-accent"
      >
        Game details
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {details.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 border-b border-border/80 pb-2"
          >
            <dt className="shrink-0 text-sm text-subtle">{row.label}</dt>
            <dd className="min-w-0 break-words text-right text-sm font-medium text-text">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
