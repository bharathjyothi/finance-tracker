import { useEffect, useState } from "react";
import type { Bill, Recurrence } from "../../db/types";
import { useStore } from "../../store/useStore";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "../ui/Field";
import { todayIso } from "../../lib/format";

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  once: "One-time",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function BillFormModal({
  open,
  onClose,
  bill,
}: {
  open: boolean;
  onClose: () => void;
  bill?: Bill;
}) {
  const addBill = useStore((s) => s.addBill);
  const editBill = useStore((s) => s.editBill);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [recurrence, setRecurrence] = useState<Recurrence>("monthly");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [autopay, setAutopay] = useState(false);
  const [notifyDays, setNotifyDays] = useState("3");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(bill?.name ?? "");
      setAmount(bill ? String(bill.amount) : "");
      setDueDate(bill?.due_date ?? todayIso());
      setRecurrence(bill?.recurrence ?? "monthly");
      setCategoryId(bill?.category_id != null ? String(bill.category_id) : "");
      setAccountId(bill?.account_id != null ? String(bill.account_id) : "");
      setAutopay(!!bill?.autopay);
      setNotifyDays(bill ? String(bill.notify_days_before) : "3");
      setNotes(bill?.notes ?? "");
    }
  }, [open, bill]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    const payload = {
      name,
      amount: parseFloat(amount),
      due_date: dueDate,
      recurrence,
      category_id: categoryId ? Number(categoryId) : null,
      account_id: accountId ? Number(accountId) : null,
      autopay,
      notify_days_before: Number(notifyDays) || 0,
      notes: notes || null,
    };
    if (bill) {
      await editBill(bill.id, payload);
    } else {
      await addBill(payload);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={bill ? "Edit Bill" : "Add Bill"}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mortgage" required />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Repeats</Label>
            <Select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
              {Object.entries(RECURRENCE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Category</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Pay from</Label>
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">None</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Notify before (days)</Label>
            <Input type="number" min="0" value={notifyDays} onChange={(e) => setNotifyDays(e.target.value)} />
          </FieldGroup>
        </div>
        <FieldGroup>
          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-2)] cursor-pointer">
            <input
              type="checkbox"
              checked={autopay}
              onChange={(e) => setAutopay(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Autopay enabled
          </label>
        </FieldGroup>
        <FieldGroup>
          <Label>Notes (optional)</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FieldGroup>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {bill ? "Save Changes" : "Add Bill"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
