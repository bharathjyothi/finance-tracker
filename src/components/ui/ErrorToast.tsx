import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "../../store/useStore";

export function ErrorToast() {
  const lastError = useStore((s) => s.lastError);
  const dismissError = useStore((s) => s.dismissError);

  useEffect(() => {
    if (!lastError) return;
    const timeout = setTimeout(dismissError, 6000);
    return () => clearTimeout(timeout);
  }, [lastError, dismissError]);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {lastError && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel bg-[var(--color-surface-2)] rounded-xl px-4 py-3 shadow-2xl max-w-sm flex items-start gap-2.5"
          >
            <AlertTriangle size={16} className="text-[var(--color-negative)] shrink-0 mt-0.5" />
            <span className="text-sm text-[var(--color-ink-1)] leading-snug">{lastError}</span>
            <button
              onClick={dismissError}
              className="shrink-0 text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
