export interface CsvRow {
  [column: string]: string;
}

/** Minimal RFC4180-ish CSV parser: handles quoted fields, commas/newlines inside quotes, escaped quotes. */
export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.length > 0)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: CsvRow = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

const COLUMN_ALIASES: Record<string, string[]> = {
  date: ["date", "transaction date", "posted date", "trans date"],
  description: ["description", "memo", "payee", "name"],
  amount: ["amount", "debit", "value"],
};

function findColumn(headers: string[], aliases: string[]): string | undefined {
  return headers.find((h) => aliases.includes(h.toLowerCase()));
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
}

/** Best-effort mapping of common bank/card CSV exports (date, description, amount columns) to transactions. */
export function mapCsvToTransactions(rows: CsvRow[]): ParsedTransaction[] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const dateCol = findColumn(headers, COLUMN_ALIASES.date);
  const descCol = findColumn(headers, COLUMN_ALIASES.description);
  const amountCol = findColumn(headers, COLUMN_ALIASES.amount);
  if (!dateCol || !descCol || !amountCol) {
    throw new Error(
      "Couldn't find date, description, and amount columns in this CSV. Expected headers like Date/Description/Amount.",
    );
  }
  return rows
    .filter((r) => r[dateCol] && r[amountCol])
    .map((r) => {
      const rawAmount = r[amountCol].replace(/[^0-9.\-]/g, "");
      const amount = Math.abs(parseFloat(rawAmount || "0"));
      const rawDate = new Date(r[dateCol]);
      const iso = Number.isNaN(rawDate.getTime())
        ? r[dateCol]
        : `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, "0")}-${String(rawDate.getDate()).padStart(2, "0")}`;
      return { date: iso, description: r[descCol] || "Imported transaction", amount };
    })
    .filter((t) => !Number.isNaN(t.amount) && t.amount > 0);
}
