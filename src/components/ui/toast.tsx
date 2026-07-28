"use client";

import { X } from "lucide-react";
import { useToastStore } from "@/store/toast";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[80] flex flex-col items-center gap-2 px-4 lg:top-24"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow)] backdrop-blur-xl animate-fade-up",
            t.tone === "success" && "border-accent/40 bg-bg-elevated/95",
            t.tone === "error" && "border-danger/40 bg-bg-elevated/95",
            t.tone === "info" && "border-border bg-bg-elevated/95",
          )}
        >
          <div className="flex-1">
            <p
              className={cn(
                "text-sm font-semibold",
                t.tone === "success" && "text-accent",
                t.tone === "error" && "text-danger",
                t.tone === "info" && "text-text",
              )}
            >
              {t.title}
            </p>
            {t.description ? (
              <p className="mt-0.5 text-xs text-muted">{t.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
            className="text-subtle hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
