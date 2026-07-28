import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-[var(--accent-fg)] hover:bg-accent-hover font-semibold shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_35%,transparent)]",
  secondary:
    "bg-secondary text-white hover:brightness-110 font-semibold",
  ghost: "bg-transparent text-text hover:bg-surface-hover",
  outline:
    "border border-border-strong bg-transparent text-text hover:border-accent hover:text-accent",
  danger: "bg-danger/15 text-danger hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-xl inline-flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
