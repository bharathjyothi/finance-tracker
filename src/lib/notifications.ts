import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { fetchBills, fetchNotifiedBillKeys, markBillNotified } from "../db/queries";
import { formatCurrency } from "./format";
import { daysUntil } from "./recurrence";

export async function ensureNotificationPermission(): Promise<boolean> {
  let granted = await isPermissionGranted();
  if (!granted) {
    const permission = await requestPermission();
    granted = permission === "granted";
  }
  return granted;
}

/** Sends a native notification for any active bill due within its notify window that hasn't been notified yet. */
export async function checkDueBillsAndNotify(): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const [bills, notifiedKeys] = await Promise.all([fetchBills(), fetchNotifiedBillKeys()]);

  for (const bill of bills) {
    const days = daysUntil(bill.due_date);
    const key = `${bill.id}:${bill.due_date}`;
    if (days > bill.notify_days_before || notifiedKeys.has(key)) continue;

    const title =
      days < 0
        ? `${bill.name} is overdue`
        : days === 0
          ? `${bill.name} is due today`
          : `${bill.name} due in ${days} day${days === 1 ? "" : "s"}`;

    sendNotification({
      title,
      body: `${formatCurrency(bill.amount)} due ${bill.due_date}`,
    });
    await markBillNotified(bill.id, bill.due_date);
  }
}
