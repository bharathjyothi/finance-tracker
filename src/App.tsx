import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "./components/layout/AppShell";
import { useStore } from "./store/useStore";
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import { Expenses } from "./pages/Expenses";
import { CalendarPage } from "./pages/Calendar";
import { Trends } from "./pages/Trends";

const NOTIFICATION_CHECK_INTERVAL_MS = 60 * 60 * 1000;

function App() {
  const init = useStore((s) => s.init);
  const loading = useStore((s) => s.loading);
  const error = useStore((s) => s.error);
  const runNotificationCheck = useStore((s) => s.runNotificationCheck);

  useEffect(() => {
    void init();
    const interval = setInterval(() => void runNotificationCheck(), NOTIFICATION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [init, runNotificationCheck]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-[var(--color-negative)] text-sm">
        {error}
      </div>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/trends" element={<Trends />} />
      </Routes>
    </AppShell>
  );
}

export default App;
