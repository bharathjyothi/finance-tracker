import { clsx } from "clsx";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-xl bg-white/[0.05] border border-[var(--color-border-subtle)] px-3 py-2 text-sm text-[var(--color-ink-1)] outline-none transition-colors focus:border-[var(--color-accent)] focus:bg-white/[0.07] placeholder:text-[var(--color-ink-3)]";

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-[var(--color-ink-2)] mb-1.5">{children}</label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(fieldBase, "resize-none", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(fieldBase, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}
