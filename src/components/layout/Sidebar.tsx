import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Wallet, Receipt, CalendarDays, LineChart } from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/accounts", label: "Accounts", icon: Wallet, end: false },
  { to: "/expenses", label: "Bills & Expenses", icon: Receipt, end: false },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, end: false },
  { to: "/trends", label: "Trends", icon: LineChart, end: false },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-[var(--color-border-subtle)] bg-white/[0.015]">
      <div data-tauri-drag-region className="drag-region h-16 shrink-0 flex items-end px-4 pb-3 pt-7">
        <span data-tauri-drag-region className="text-sm font-semibold tracking-tight text-[var(--color-ink-1)]">
          Finance Tracker
        </span>
      </div>
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {({ isActive }) => (
              <div
                className={clsx(
                  "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-[var(--color-ink-1)]"
                    : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-white/[0.07] border border-[var(--color-border-subtle)]"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <item.icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-[11px] text-[var(--color-ink-3)]">
        All data stays on this Mac. Nothing syncs.
      </div>
    </aside>
  );
}
