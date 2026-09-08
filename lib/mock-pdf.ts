/**
 * A dependency-free generator for a *genuinely valid* one-page PDF.
 *
 * The admin panel has several "produce a PDF" actions (download report,
 * export analytics, generate payslip). Rather than downloading a fake file
 * with a .pdf extension, this writes a real, minimal PDF 1.4 document so the
 * download opens correctly in any viewer. It is still SAMPLE OUTPUT — swap it
 * for a server-rendered document when the real reporting service exists.
 */

type PdfDoc = {
  title: string;
  subtitle?: string;
  lines: string[];
};

/** PDF strings escape backslash and both parentheses. */
function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // Drop anything outside WinAnsi's safe ASCII range so the base-14 font
    // renders predictably (₹, en dashes and smart quotes get transliterated).
    .replace(/[₹]/g, "Rs. ")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, "");
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

export function buildPdf({ title, subtitle, lines }: PdfDoc): Blob {
  const body: string[] = [];
  body.push("BT", "/F1 20 Tf", "56 780 Td", `(${escapePdfText(title)}) Tj`, "ET");

  if (subtitle) {
    body.push(
      "BT",
      "/F2 11 Tf",
      "0.42 0.40 0.52 rg",
      "56 758 Td",
      `(${escapePdfText(subtitle)}) Tj`,
      "ET",
    );
  }

  body.push("0.14 0.12 0.20 rg", "BT", "/F2 11 Tf", "56 720 Td", "16 TL");
  lines.forEach((line, index) => {
    body.push(
      index === 0 ? `(${escapePdfText(line)}) Tj` : `T* (${escapePdfText(line)}) Tj`,
    );
  });
  body.push("ET");

  const content = body.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = byteLength(pdf);
  const size = objects.length + 1;

  pdf += `xref\n0 ${size}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new Blob([pdf], { type: "application/pdf" });
}

/** Builds the PDF and hands it to the browser as a download. */
export function downloadPdf(fileName: string, doc: PdfDoc) {
  const url = URL.createObjectURL(buildPdf(doc));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a tick to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
