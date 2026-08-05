import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type ButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:brightness-110 shadow-[0_4px_16px_-4px_var(--color-accent)]",
  secondary:
    "bg-white/[0.06] text-[var(--color-ink-1)] hover:bg-white/[0.1] border border-[var(--color-border-subtle)]",
  ghost: "text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] hover:bg-white/[0.06]",
  danger: "bg-[var(--color-negative-soft)] text-[var(--color-negative)] hover:brightness-125",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
};

export function Button({ variant = "secondary", size = "md", className, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
