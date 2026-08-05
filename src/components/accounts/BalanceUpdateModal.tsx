import { useEffect, useState } from "react";
import type { Account } from "../../db/types";
import { useStore } from "../../store/useStore";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldGroup, Input, Label } from "../ui/Field";

export function BalanceUpdateModal({
  open,
  onClose,
  account,
}: {
  open: boolean;
  onClose: () => void;
  account?: Account;
}) {
  const setAccountBalance = useStore((s) => s.setAccountBalance);
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (open && account) setBalance(String(account.balance));
  }, [open, account]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    await setAccountBalance(account.id, parseFloat(balance) || 0);
    onClose();
  }

  if (!account) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Update ${account.name}`}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Label>{account.account_type === "credit_card" ? "New Balance Owed" : "New Balance"}</Label>
          <Input
            type="number"
            step="0.01"
            autoFocus
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
        </FieldGroup>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
