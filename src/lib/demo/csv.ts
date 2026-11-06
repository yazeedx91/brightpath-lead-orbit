import type { Company, Contact, Lead } from "./types";

export const CSV_HEADERS = [
  "Prospect ID", "Company", "Contact", "Title", "Industry", "City", "Country", "Employees",
  "Score", "Qualification", "Review status", "Email (fictional)", "Website (fictional)", "Source",
] as const;

function cell(v: string | number): string {
  let s = String(v);
  // Neutralise spreadsheet formulas (CSV injection).
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function prospectsToCsv(rows: { l: Lead; co: Company; ct: Contact }[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const { l, co, ct } of rows) {
    lines.push([
      co.prospectId, co.name, ct.name, ct.title, co.sector, co.city, co.country, co.employees,
      l.score, l.qualification, l.review, ct.email, co.website, co.source,
    ].map(cell).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
