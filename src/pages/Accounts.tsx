import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { AccountCard } from "../components/accounts/AccountCard";
import { AccountFormModal } from "../components/accounts/AccountFormModal";
import { BalanceUpdateModal } from "../components/accounts/BalanceUpdateModal";
import type { Account, AccountType } from "../db/types";
import { ACCOUNT_TYPE_LABEL } from "../lib/icons";

const GROUP_ORDER: AccountType[] = ["checking", "savings", "brokerage", "credit_card"];

export function Accounts() {
  const accounts = useStore((s) => s.accounts);
  const removeAccount = useStore((s) => s.removeAccount);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [balanceAccount, setBalanceAccount] = useState<Account | undefined>();

  const grouped = GROUP_ORDER.map((type) => ({
    type,
    accounts: accounts.filter((a) => a.account_type === type),
  })).filter((g) => g.accounts.length > 0);

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Manually tracked balances — nothing here connects to your real banks."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingAccount(undefined);
              setFormOpen(true);
            }}
          >
            <Plus size={15} /> Add Account
          </Button>
        }
      />

      {grouped.length === 0 ? (
        <div className="text-center py-24 text-[var(--color-ink-3)] text-sm">
          No accounts yet. Add your first one to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((group) => (
            <div key={group.type}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-3)] mb-3">
                {ACCOUNT_TYPE_LABEL[group.type]}
              </h3>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.accounts.map((account, i) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    delay={i * 0.04}
                    onEdit={() => {
                      setEditingAccount(account);
                      setFormOpen(true);
                    }}
                    onDelete={() => {
                      if (confirm(`Remove ${account.name}? This won't delete its history.`)) {
                        void removeAccount(account.id);
                      }
                    }}
                    onUpdateBalance={() => setBalanceAccount(account)}
                  />
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      )}

      <AccountFormModal open={formOpen} onClose={() => setFormOpen(false)} account={editingAccount} />
      <BalanceUpdateModal
        open={!!balanceAccount}
        onClose={() => setBalanceAccount(undefined)}
        account={balanceAccount}
      />
    </div>
  );
}
