import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, Plus, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { BillRow } from "../components/bills/BillRow";
import { BillFormModal } from "../components/bills/BillFormModal";
import { ExpenseFormModal } from "../components/expenses/ExpenseFormModal";
import { CsvImportModal } from "../components/expenses/CsvImportModal";
import { formatCurrency, formatDate } from "../lib/format";
import { resolveIcon } from "../lib/icons";
import type { Bill } from "../db/types";

export function Expenses() {
  const bills = useStore((s) => s.bills);
  const categories = useStore((s) => s.categories);
  const expenses = useStore((s) => s.expenses);
  const markBillPaid = useStore((s) => s.markBillPaid);
  const removeBill = useStore((s) => s.removeBill);
  const removeExpense = useStore((s) => s.removeExpense);

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const sortedBills = [...bills].sort((a, b) => (a.due_date < b.due_date ? -1 : 1));

  return (
    <div>
      <PageHeader
        title="Bills & Expenses"
        subtitle="Recurring bills, one-off spending, and CSV imports."
        actions={
          <>
            <Button variant="secondary" onClick={() => setCsvModalOpen(true)}>
              <FileUp size={15} /> Import Statement
            </Button>
            <Button variant="secondary" onClick={() => setExpenseModalOpen(true)}>
              <Plus size={15} /> Add Expense
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingBill(undefined);
                setBillModalOpen(true);
              }}
            >
              <Plus size={15} /> Add Bill
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 p-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink-1)] mb-1">Recurring Bills</h3>
          {sortedBills.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-ink-3)]">
              No bills yet — add your mortgage, insurance, utilities, etc.
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {sortedBills.map((bill, i) => (
                <div key={bill.id} className="group relative">
                  <BillRow
                    bill={bill}
                    category={categories.find((c) => c.id === bill.category_id)}
                    onMarkPaid={markBillPaid}
                    delay={i * 0.02}
                  />
                  <div className="absolute right-8 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => {
                        setEditingBill(bill);
                        setBillModalOpen(true);
                      }}
                      className="text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-accent)] cursor-pointer px-1.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirm(`Delete ${bill.name}?`) && removeBill(bill.id)}
                      className="text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-negative)] cursor-pointer px-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          )}
        </Card>

        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink-1)] mb-1">All Expenses</h3>
          {expenses.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-ink-3)]">
              No expenses logged yet.
            </div>
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              {expenses.map((expense) => {
                const category = categories.find((c) => c.id === expense.category_id);
                const Icon = resolveIcon(category?.icon);
                return (
                  <motion.div
                    layout
                    key={expense.id}
                    className="group flex items-center gap-3 py-2.5 border-b border-[var(--color-border-subtle)] last:border-0"
                  >
                    <div
                      className="shrink-0 rounded-lg p-1.5"
                      style={{
                        backgroundColor: `${category?.color ?? "#71717a"}1a`,
                        color: category?.color ?? "#71717a",
                      }}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-[var(--color-ink-1)] truncate">{expense.description}</div>
                      <div className="text-[11px] text-[var(--color-ink-3)]">{formatDate(expense.date)}</div>
                    </div>
                    <span className="text-sm font-medium tabular text-[var(--color-ink-1)]">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-ink-3)] hover:text-[var(--color-negative)] cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <BillFormModal
        open={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        bill={editingBill}
      />
      <ExpenseFormModal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} />
      <CsvImportModal open={csvModalOpen} onClose={() => setCsvModalOpen(false)} />
    </div>
  );
}
