import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex max-w-full flex-wrap items-center gap-1 overflow-hidden text-sm",
        className,
      )}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span
            key={`${item.label}-${i}`}
            className="inline-flex min-w-0 max-w-full items-center gap-1"
          >
            {i > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-subtle" /> : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="truncate text-muted transition hover:text-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "break-words",
                  isLast ? "line-clamp-2 text-text" : "truncate text-muted",
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
