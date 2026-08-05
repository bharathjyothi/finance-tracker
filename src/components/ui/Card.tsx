import { motion, type HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

type CardProps = HTMLMotionProps<"div"> & { interactive?: boolean };

export function Card({ className, interactive, children, ...props }: CardProps) {
  return (
    <motion.div
      className={clsx(
        "glass-panel rounded-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]",
        interactive && "transition-colors hover:border-white/[0.14] cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
