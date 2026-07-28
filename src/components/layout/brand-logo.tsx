import Link from "next/link";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: {
    wrap: "gap-2",
    mark: "h-8 w-8",
    text: "text-[1.05rem] sm:text-lg",
  },
  md: {
    wrap: "gap-2.5",
    mark: "h-10 w-10",
    text: "text-xl sm:text-2xl",
  },
  lg: {
    wrap: "gap-3",
    mark: "h-12 w-12 sm:h-14 sm:w-14",
    text: "text-2xl sm:text-3xl md:text-4xl",
  },
  hero: {
    wrap: "gap-3.5 sm:gap-5",
    mark: "h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28",
    text: "text-3xl sm:text-5xl md:text-6xl lg:text-7xl",
  },
} as const;

/** Building-block toy mark. */
export function BrandMark({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 overflow-visible", className)}
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        className={cn("fill-accent/10", animated && "brand-logo-aura")}
      />
      <g className={cn(animated && "brand-logo-controller")}>
        <rect x="14" y="28" width="16" height="14" rx="3" className="fill-accent" />
        <circle cx="18" cy="26" r="2.4" className="fill-accent" />
        <circle cx="26" cy="26" r="2.4" className="fill-accent" />
        <rect x="34" y="22" width="16" height="14" rx="3" className="fill-secondary" />
        <circle cx="38" cy="20" r="2.4" className="fill-secondary" />
        <circle cx="46" cy="20" r="2.4" className="fill-secondary" />
        <rect x="24" y="36" width="16" height="12" rx="3" className="fill-secondary/80" />
      </g>
    </svg>
  );
}

export function BrandWordmark({
  className,
  textClassName,
  animated = true,
}: {
  className?: string;
  textClassName?: string;
  animated?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-baseline font-extrabold tracking-[-0.04em]",
        className,
      )}
    >
      <span className={cn("text-text", textClassName)}>Toy</span>
      <span className={cn(animated ? "brand-logo-pk text-accent" : "text-accent", textClassName)}>
        Company
      </span>
    </span>
  );
}

export function BrandLogo({
  className,
  compact,
  size = "sm",
  priority: _priority,
  animated = true,
}: {
  className?: string;
  priority?: boolean;
  compact?: boolean;
  size?: keyof typeof SIZE;
  animated?: boolean;
}) {
  const s = SIZE[size];
  const isHero = size === "hero";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex max-w-full items-center transition duration-300",
        "hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        s.wrap,
        animated && isHero && "brand-logo-hero",
        className,
      )}
      aria-label={SITE.name}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl",
          "bg-surface/70 ring-1 ring-border/70",
          "transition duration-300 group-hover:ring-accent/50",
          s.mark,
          isHero && "rounded-3xl",
          animated
            ? "brand-logo-mark"
            : "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        )}
      >
        {animated ? (
          <span
            aria-hidden
            className="brand-logo-ring pointer-events-none absolute -inset-[40%] opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, color-mix(in srgb, var(--accent) 55%, transparent) 18%, transparent 32%, transparent 55%, color-mix(in srgb, var(--accent-secondary) 40%, transparent) 70%, transparent 85%)",
              maskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
              WebkitMaskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
            }}
          />
        ) : null}

        <BrandMark
          animated={animated}
          className={cn(
            "relative z-[1] h-[82%] w-[82%] transition duration-300 group-hover:scale-[1.06]",
          )}
        />
      </span>
      {!compact ? (
        <BrandWordmark
          animated={animated}
          className="min-w-0"
          textClassName={cn(
            s.text,
            "leading-none transition duration-300",
            isHero && "drop-shadow-[0_10px_28px_color-mix(in_srgb,var(--accent)_22%,transparent)]",
          )}
        />
      ) : null}
    </Link>
  );
}
