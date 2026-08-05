import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { FileUp } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldGroup, Label, Select } from "../ui/Field";
import { mapCsvToTransactions, parseCsv, type ParsedTransaction } from "../../lib/csv";
import { extractTextFromPdf, parseStatementText } from "../../lib/pdf";
import { formatCurrency } from "../../lib/format";

export function CsvImportModal({ open: isOpen, onClose }: { open: boolean; onClose: () => void }) {
  const importExpenses = useStore((s) => s.importExpenses);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);

  const [fileName, setFileName] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function pickFile() {
    setError(null);
    const path = await open({
      multiple: false,
      filters: [{ name: "Statement", extensions: ["csv", "pdf"] }],
    });
    if (!path || Array.isArray(path)) return;
    try {
      const isPdf = path.toLowerCase().endsWith(".pdf");
      let parsed: ParsedTransaction[];
      if (isPdf) {
        const bytes = await invoke<number[]>("read_binary_file", { path });
        const text = await extractTextFromPdf(new Uint8Array(bytes));
        parsed = parseStatementText(text);
        if (parsed.length === 0) {
          throw new Error(
            "Couldn't find any transaction lines in this PDF. Statement layouts vary a lot — if this keeps happening, a CSV export (when your bank offers one) will import more reliably.",
          );
        }
      } else {
        const text = await invoke<string>("read_text_file", { path });
        const rows = parseCsv(text);
        parsed = mapCsvToTransactions(rows);
      }
      setTransactions(parsed);
      setFileName(path.split("/").pop() ?? path);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setTransactions([]);
    }
  }

  async function handleImport() {
    setImporting(true);
    await importExpenses(
      transactions.map((t) => ({
        description: t.description,
        amount: t.amount,
        date: t.date,
        category_id: categoryId ? Number(categoryId) : null,
        account_id: accountId ? Number(accountId) : null,
      })),
    );
    setImporting(false);
    reset();
    onClose();
  }

  function reset() {
    setFileName(null);
    setTransactions([]);
    setError(null);
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Import Transactions"
    >
      {!fileName ? (
        <button
          onClick={pickFile}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border-strong)] py-10 text-[var(--color-ink-3)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
        >
          <FileUp size={22} />
          <span className="text-sm">Choose a CSV or PDF statement from your bank</span>
        </button>
      ) : (
        <div>
          <div className="text-sm text-[var(--color-ink-1)] mb-1">{fileName}</div>
          <div className="text-xs text-[var(--color-ink-3)] mb-4">
            {transactions.length} transactions found, totaling{" "}
            {formatCurrency(transactions.reduce((s, t) => s + t.amount, 0))}
            {fileName.toLowerCase().endsWith(".pdf") && " — review below, PDF parsing is best-effort"}
          </div>

          <div className="max-h-52 overflow-y-auto rounded-lg bg-white/[0.03] p-2 mb-4">
            {transactions.map((t, i) => (
              <div key={i} className="group flex items-center justify-between text-xs py-1.5 gap-2">
                <span className="text-[var(--color-ink-3)] shrink-0 w-16 tabular">{t.date}</span>
                <span className="truncate flex-1 text-[var(--color-ink-2)]">{t.description}</span>
                <span className="tabular shrink-0 text-[var(--color-ink-1)]">{formatCurrency(t.amount)}</span>
                <button
                  type="button"
                  onClick={() => setTransactions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-ink-3)] hover:text-[var(--color-negative)] cursor-pointer transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>Category for all</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label>Account</Label>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">None</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </div>
        </div>
      )}

      {error && <div className="mt-3 text-xs text-[var(--color-negative)]">{error}</div>}

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancel
        </Button>
        {fileName && (
          <Button variant="secondary" onClick={reset}>
            Choose different file
          </Button>
        )}
        <Button
          variant="primary"
          disabled={transactions.length === 0 || importing}
          onClick={handleImport}
        >
          {importing ? "Importing…" : `Import ${transactions.length || ""}`}
        </Button>
      </div>
    </Modal>
  );
}
