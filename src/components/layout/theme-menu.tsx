"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Coffee,
  Cpu,
  Flame,
  Monitor,
  Moon,
  Sun,
  Sunset,
  Trees,
  Waves,
} from "lucide-react";
import {
  THEME_DESCRIPTIONS,
  THEME_LABELS,
  THEME_ORDER,
  THEME_SWATCHES,
  useThemeStore,
  type Theme,
} from "@/store/theme";
import { cn } from "@/lib/utils";

const THEME_ICONS: Record<Theme, typeof Moon> = {
  dark: Moon,
  light: Sun,
  sepia: Coffee,
  ocean: Waves,
  forest: Trees,
  crimson: Flame,
  cyber: Cpu,
  sunset: Sunset,
  oled: Monitor,
};

/** Mini game-disc swatch — hub, grooves, and theme-colored data ring. */
function ThemeDisc({
  bg,
  surface,
  accent,
  spinning,
}: {
  bg: string;
  surface: string;
  accent: string;
  spinning?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const sheen = `disc-sheen-${uid}`;
  const ring = `disc-ring-${uid}`;

  return (
    <span
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center",
        spinning ? "theme-disc-spin" : "theme-disc-idle",
      )}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="h-full w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
        <defs>
          <radialGradient id={ring} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
            <stop offset="28%" stopColor={surface} stopOpacity="1" />
            <stop offset="55%" stopColor={bg} stopOpacity="1" />
            <stop offset="78%" stopColor={surface} stopOpacity="1" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.85" />
          </radialGradient>
          <linearGradient id={sheen} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer rim */}
        <circle cx="20" cy="20" r="18.5" fill={`url(#${ring})`} />
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
        <circle cx="20" cy="20" r="18.5" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />

        {/* Data grooves */}
        {[7.2, 9.1, 11, 12.9, 14.8].map((r) => (
          <circle
            key={r}
            cx="20"
            cy="20"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="0.45"
          />
        ))}
        {[8.15, 10.05, 11.95, 13.85].map((r) => (
          <circle
            key={`d-${r}`}
            cx="20"
            cy="20"
            r={r}
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="0.35"
          />
        ))}

        {/* Segment shine like a spinning disc */}
        <path
          d="M20 2.2A17.8 17.8 0 0 1 36.4 14.5L20 20Z"
          fill="rgba(255,255,255,0.16)"
        />
        <path
          d="M20 2.2A17.8 17.8 0 0 0 5.2 12.8L20 20Z"
          fill="rgba(0,0,0,0.12)"
        />

        {/* Gloss overlay */}
        <circle cx="20" cy="20" r="18.2" fill={`url(#${sheen})`} />

        {/* Label ring / hub ring in accent */}
        <circle cx="20" cy="20" r="6.1" fill={accent} />
        <circle cx="20" cy="20" r="6.1" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        <circle cx="20" cy="20" r="4.35" fill={bg} />
        <circle cx="20" cy="20" r="4.35" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />

        {/* Spindle hole */}
        <circle cx="20" cy="20" r="1.85" fill="#050505" />
        <circle cx="20" cy="20" r="1.85" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.35" />
      </svg>
    </span>
  );
}

type Props = {
  /** Compact icon trigger for the header */
  compact?: boolean;
  /** Full-width expanding panel (mobile drawer / settings) */
  fullWidth?: boolean;
  className?: string;
  align?: "left" | "right";
};

function ThemeOptionList({
  open,
  theme,
  onPick,
  staggered,
}: {
  open: boolean;
  theme: Theme;
  onPick: (id: Theme) => void;
  staggered?: boolean;
}) {
  return (
    <ul role="listbox" aria-label="Theme options" className="space-y-0.5 p-1.5">
      {THEME_ORDER.map((id, index) => {
        const OptionIcon = THEME_ICONS[id];
        const selected = theme === id;
        const [bg, surface, accent] = THEME_SWATCHES[id];
        return (
          <li key={id} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => onPick(id)}
              style={
                staggered
                  ? { transitionDelay: open ? `${index * 35}ms` : "0ms" }
                  : undefined
              }
              className={cn(
                "group/theme flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition duration-200",
                "hover:bg-surface-hover",
                selected && "bg-accent-dim",
                staggered && (open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"),
              )}
            >
              <ThemeDisc
                bg={bg}
                surface={surface}
                accent={accent}
                spinning={selected}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-semibold",
                    selected ? "text-accent" : "text-text",
                  )}
                >
                  <OptionIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  {THEME_LABELS[id]}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {THEME_DESCRIPTIONS[id]}
                </span>
              </span>
              {selected ? (
                <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              ) : (
                <span className="w-4 shrink-0" aria-hidden />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type PanelPos = { top: number; left: number; width: number; maxHeight: number };

export function ThemeMenu({
  compact = false,
  fullWidth = false,
  className,
  align = "right",
}: Props) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const Icon = THEME_ICONS[theme] ?? Moon;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(296, window.innerWidth - 16);
    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const gap = 8;
    const top = rect.bottom + gap;
    const maxHeight = Math.max(160, Math.min(window.innerHeight - top - 12, 420));
    setPos({ top, left, width, maxHeight });
  };

  useLayoutEffect(() => {
    if (!open || fullWidth) return;
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, fullWidth, align]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id: Theme) => {
    setTheme(id);
    setOpen(false);
  };

  const floatingPanel =
    mounted && open && !fullWidth && pos
      ? createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="presentation"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
            className={cn(
              "fixed z-[120] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-bg-elevated shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
              "animate-fade-up",
            )}
          >
            <div
              className="pointer-events-none sticky top-0 z-[1] h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
              aria-hidden
            />
            <ThemeOptionList open={open} theme={theme} onPick={pick} staggered />
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative", fullWidth && "w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Theme: ${THEME_LABELS[theme]}. Open theme menu.`}
        title={`Theme: ${THEME_LABELS[theme]}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          compact &&
            "relative flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-surface-hover hover:text-text",
          fullWidth &&
            "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-base font-medium text-text hover:border-accent/40",
          !compact &&
            !fullWidth &&
            "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:border-accent/40",
          open && (compact ? "bg-surface-hover text-accent" : "border-accent/50 text-accent"),
        )}
      >
        {compact ? (
          <Icon className="h-4 w-4" />
        ) : (
          <>
            <span className="inline-flex min-w-0 items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-accent" />
              <span className="truncate">{mounted ? THEME_LABELS[theme] : "Theme"}</span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                open && "rotate-180 text-accent",
              )}
            />
          </>
        )}
      </button>

      {fullWidth ? (
        <div
          id={listId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "mt-2 overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-lg transition-transform duration-300",
                open ? "translate-y-0" : "-translate-y-1",
              )}
            >
              <ThemeOptionList open={open} theme={theme} onPick={pick} staggered />
            </div>
          </div>
        </div>
      ) : (
        floatingPanel
      )}
    </div>
  );
}
