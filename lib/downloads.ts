import { downloadPdf } from "./mock-pdf";

export { downloadPdf };

/**
 * Turns rows into a CSV file and hands it to the browser.
 * Values are quoted and internal quotes doubled, so commas, quotes and
 * newlines inside a cell survive the round trip into a spreadsheet.
 */
export function downloadCsv(
  fileName: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escape = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");

  // The BOM makes Excel open UTF-8 (₹, °, é) correctly instead of as mojibake.
  const blob = new Blob([`﻿${csv}`], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
