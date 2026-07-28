import Link from "next/link";

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

/** Compact, wrapping pagination that stays usable on narrow phones. */
export function CatalogPagination({
  page,
  totalPages,
  hrefForPage,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages: number[] = [];
  for (let n = start; n <= end; n++) pages.push(n);

  const linkClass = (active: boolean) =>
    `flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-medium tabular-nums sm:h-10 sm:min-w-10 ${
      active
        ? "bg-accent text-[#04110e]"
        : "border border-border text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:mt-10 sm:gap-2"
    >
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} className={linkClass(false)} aria-label="Previous page">
          Prev
        </Link>
      ) : null}
      {start > 1 ? (
        <>
          <Link href={hrefForPage(1)} className={linkClass(false)}>
            1
          </Link>
          {start > 2 ? <span className="px-1 text-subtle">…</span> : null}
        </>
      ) : null}
      {pages.map((n) => (
        <Link
          key={n}
          href={hrefForPage(n)}
          className={linkClass(n === page)}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </Link>
      ))}
      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? <span className="px-1 text-subtle">…</span> : null}
          <Link href={hrefForPage(totalPages)} className={linkClass(false)}>
            {totalPages}
          </Link>
        </>
      ) : null}
      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} className={linkClass(false)} aria-label="Next page">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
