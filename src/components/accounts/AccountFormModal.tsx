import { useEffect, useState } from "react";
import type { Account, AccountType } from "../../db/types";
import { useStore } from "../../store/useStore";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldGroup, Input, Label, Select } from "../ui/Field";
import { ACCOUNT_TYPE_LABEL } from "../../lib/icons";

const TYPE_ICON: Record<AccountType, string> = {
  checking: "landmark",
  savings: "piggy-bank",
  brokerage: "trending-up",
  credit_card: "credit-card",
};

const TYPE_COLOR: Record<AccountType, string> = {
  checking: "#0f4fa8",
  savings: "#00c774",
  brokerage: "#4c9a2a",
  credit_card: "#d03027",
};

interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  account?: Account;
}

export function AccountFormModal({ open, onClose, account }: AccountFormModalProps) {
  const addAccount = useStore((s) => s.addAccount);
  const editAccount = useStore((s) => s.editAccount);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("0");
  const [creditLimit, setCreditLimit] = useState("");

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "");
      setInstitution(account?.institution ?? "");
      setAccountType(account?.account_type ?? "checking");
      setBalance(account ? String(account.balance) : "0");
      setCreditLimit(account?.credit_limit != null ? String(account.credit_limit) : "");
    }
  }, [open, account]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !institution.trim()) return;

    if (account) {
      await editAccount(account.id, {
        name,
        institution,
        account_type: accountType,
        credit_limit: creditLimit ? parseFloat(creditLimit) : null,
      });
    } else {
      await addAccount({
        name,
        institution,
        account_type: accountType,
        balance: parseFloat(balance) || 0,
        credit_limit: creditLimit ? parseFloat(creditLimit) : null,
        color: TYPE_COLOR[accountType],
        icon: TYPE_ICON[accountType],
      });
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={account ? "Edit Account" : "Add Account"}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Label>Nickname</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chase Checking" required />
        </FieldGroup>
        <FieldGroup>
          <Label>Institution</Label>
          <Input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. Chase"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <Label>Account Type</Label>
          <Select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)}>
            {Object.entries(ACCOUNT_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        {!account && (
          <FieldGroup>
            <Label>{accountType === "credit_card" ? "Current Balance Owed" : "Current Balance"}</Label>
            <Input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </FieldGroup>
        )}
        {accountType === "credit_card" && (
          <FieldGroup>
            <Label>Credit Limit (optional)</Label>
            <Input
              type="number"
              step="0.01"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="e.g. 10000"
            />
          </FieldGroup>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {account ? "Save Changes" : "Add Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
