import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { ParsedTransaction } from "./csv";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** Reconstructs line-based text from a PDF's text runs, grouping items that share a Y position. */
export async function extractTextFromPdf(bytes: Uint8Array): Promise<string> {
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    const lines = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      const bucket = [...lines.keys()].find((key) => Math.abs(key - y) <= 2) ?? y;
      const line = lines.get(bucket) ?? [];
      line.push({ x: item.transform[4], str: item.str });
      lines.set(bucket, line);
    }

    const sortedLines = [...lines.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => items.sort((a, b) => a.x - b.x).map((i) => i.str).join(" "));

    pageTexts.push(sortedLines.join("\n"));
  }

  return pageTexts.join("\n\n");
}

const TRANSACTION_LINE = /(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+(.+?)\s+\$?(-?\d[\d,]*\.\d{2})\s*$/;
const CURRENT_YEAR = new Date().getFullYear();

function normalizeDate(raw: string): string {
  const parts = raw.split(/[/-]/).map(Number);
  let [month, day, year] = parts;
  if (parts.length === 2) year = CURRENT_YEAR;
  if (year < 100) year += 2000;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return raw;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Best-effort extraction of transaction-shaped lines ("<date> <description> <amount>") from statement text. */
export function parseStatementText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    const match = line.match(TRANSACTION_LINE);
    if (!match) continue;
    const [, dateStr, description, amountStr] = match;
    const amount = Math.abs(parseFloat(amountStr.replace(/,/g, "")));
    if (Number.isNaN(amount) || amount === 0) continue;
    if (/balance|total|payment due|minimum due|interest rate|apr\b/i.test(description)) continue;
    transactions.push({ date: normalizeDate(dateStr), description: description.trim(), amount });
  }
  return transactions;
}
