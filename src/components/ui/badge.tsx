import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "secondary" | "success" | "warning";
  className?: string;
}) {
  const styles = {
    default: "bg-surface-hover text-muted border-border",
    accent: "bg-accent-dim text-accent border-accent/20",
    secondary: "bg-secondary-dim text-secondary border-secondary/20",
    success: "bg-accent-dim text-accent border-accent/20",
    warning: "bg-warning/15 text-warning border-warning/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
