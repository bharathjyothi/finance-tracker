import { create } from "zustand";
import type { Account, AccountType, Bill, BillPayment, Category, Expense, Recurrence } from "../db/types";
import * as q from "../db/queries";
import { checkDueBillsAndNotify } from "../lib/notifications";
import { nextDueDate } from "../lib/recurrence";

interface StoreState {
  accounts: Account[];
  categories: Category[];
  bills: Bill[];
  billPayments: BillPayment[];
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  lastError: string | null;
  dismissError: () => void;

  init: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshBills: () => Promise<void>;
  refreshExpenses: () => Promise<void>;

  addAccount: (input: {
    name: string;
    institution: string;
    account_type: AccountType;
    balance: number;
    credit_limit: number | null;
    color: string;
    icon: string | null;
  }) => Promise<void>;
  editAccount: (
    id: number,
    input: Partial<{
      name: string;
      institution: string;
      account_type: AccountType;
      credit_limit: number | null;
      color: string;
      icon: string | null;
    }>,
  ) => Promise<void>;
  setAccountBalance: (id: number, balance: number) => Promise<void>;
  removeAccount: (id: number) => Promise<void>;

  addCategory: (input: { name: string; color: string; icon: string | null }) => Promise<Category>;

  addBill: (input: {
    name: string;
    category_id: number | null;
    amount: number;
    due_date: string;
    recurrence: Recurrence;
    account_id: number | null;
    autopay: boolean;
    notify_days_before: number;
    notes: string | null;
  }) => Promise<void>;
  editBill: (
    id: number,
    input: Partial<{
      name: string;
      category_id: number | null;
      amount: number;
      due_date: string;
      recurrence: Recurrence;
      account_id: number | null;
      autopay: boolean;
      notify_days_before: number;
      notes: string | null;
      is_active: boolean;
    }>,
  ) => Promise<void>;
  removeBill: (id: number) => Promise<void>;
  markBillPaid: (bill: Bill) => Promise<void>;

  addExpense: (input: {
    description: string;
    amount: number;
    category_id: number | null;
    account_id: number | null;
    date: string;
  }) => Promise<void>;
  importExpenses: (
    inputs: {
      description: string;
      amount: number;
      category_id: number | null;
      account_id: number | null;
      date: string;
    }[],
  ) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;

  runNotificationCheck: () => Promise<void>;
}

/** Runs a mutation, surfacing any failure as a dismissible toast instead of failing silently. */
async function guarded(set: (partial: Partial<StoreState>) => void, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(message);
    set({ lastError: message });
  }
}

export const useStore = create<StoreState>((set, get) => ({
  accounts: [],
  categories: [],
  bills: [],
  billPayments: [],
  expenses: [],
  loading: true,
  error: null,
  lastError: null,
  dismissError: () => set({ lastError: null }),

  init: async () => {
    set({ loading: true, error: null });
    try {
      const [accounts, categories, bills, billPayments, expenses] = await Promise.all([
        q.fetchAccounts(),
        q.fetchCategories(),
        q.fetchBills(),
        q.fetchBillPayments(),
        q.fetchExpenses(),
      ]);
      set({ accounts, categories, bills, billPayments, expenses, loading: false });
      void get().runNotificationCheck();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  refreshAccounts: async () => set({ accounts: await q.fetchAccounts() }),
  refreshBills: async () =>
    set({ bills: await q.fetchBills(), billPayments: await q.fetchBillPayments() }),
  refreshExpenses: async () => set({ expenses: await q.fetchExpenses() }),

  addAccount: async (input) =>
    guarded(set, async () => {
      await q.createAccount(input);
      await get().refreshAccounts();
    }),
  editAccount: async (id, input) =>
    guarded(set, async () => {
      await q.updateAccount(id, input);
      await get().refreshAccounts();
    }),
  setAccountBalance: async (id, balance) =>
    guarded(set, async () => {
      await q.updateAccountBalance(id, balance);
      await get().refreshAccounts();
    }),
  removeAccount: async (id) =>
    guarded(set, async () => {
      await q.archiveAccount(id);
      await get().refreshAccounts();
    }),

  addCategory: async (input) => {
    const id = await q.createCategory(input);
    const categories = await q.fetchCategories();
    set({ categories });
    return categories.find((c) => c.id === id)!;
  },

  addBill: async (input) =>
    guarded(set, async () => {
      await q.createBill(input);
      await get().refreshBills();
    }),
  editBill: async (id, input) =>
    guarded(set, async () => {
      await q.updateBill(id, input);
      await get().refreshBills();
    }),
  removeBill: async (id) =>
    guarded(set, async () => {
      await q.deleteBill(id);
      await get().refreshBills();
    }),
  markBillPaid: async (bill) =>
    guarded(set, async () => {
      await q.recordBillPayment(bill);
      const next = nextDueDate(bill.due_date, bill.recurrence);
      if (next) {
        await q.updateBill(bill.id, { due_date: next });
      } else {
        await q.updateBill(bill.id, { is_active: false });
      }
      await get().refreshBills();
    }),

  addExpense: async (input) =>
    guarded(set, async () => {
      await q.createExpense(input);
      await get().refreshExpenses();
    }),
  importExpenses: async (inputs) =>
    guarded(set, async () => {
      await q.createExpensesBulk(inputs);
      await get().refreshExpenses();
    }),
  removeExpense: async (id) =>
    guarded(set, async () => {
      await q.deleteExpense(id);
      await get().refreshExpenses();
    }),

  runNotificationCheck: async () => {
    try {
      await checkDueBillsAndNotify();
    } catch {
      // notifications are best-effort; permission may be denied
    }
  },
}));
