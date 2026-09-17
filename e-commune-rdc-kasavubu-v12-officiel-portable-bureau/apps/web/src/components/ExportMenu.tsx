"use client";

import { useState } from "react";

type ExportRow = Record<string, unknown>;
type ExportColumn = { key: string; label: string };
type ExportContext = { generatedBy: string; communeName: string; generatedAt: string };

function printable(value: unknown) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(printable).join(" • ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function stamp(value: string) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function logExport(dataset: string, format: string, rowCount: number, scope: string): Promise<ExportContext> {
  const fallback: ExportContext = {
    generatedBy: "Agent e-Commune",
    communeName: "Kasa-Vubu",
    generatedAt: new Date().toISOString(),
  };
  try {
    const response = await fetch("/api/exports/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataset, format, rowCount, scope }),
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    return {
      generatedBy: data.generatedBy || fallback.generatedBy,
      communeName: data.communeName || fallback.communeName,
      generatedAt: data.generatedAt || fallback.generatedAt,
    };
  } catch {
    return fallback;
  }
}

export function ExportMenu({
  title,
  dataset,
  rows,
  columns,
  fileName,
  scopeLabel = "vue courante",
  disabled = false,
}: {
  title: string;
  dataset: string;
  rows: ExportRow[];
  columns: ExportColumn[];
  fileName: string;
  scopeLabel?: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(format: "csv" | "xlsx" | "pdf" | "json") {
    if (!rows.length || disabled || busy) return;
    setBusy(format);
    setError("");
    try {
      const context = await logExport(dataset, format.toUpperCase(), rows.length, scopeLabel);
      const base = `${safeFileName(fileName)}-${stamp(context.generatedAt)}`;
      const matrix = rows.map((row) => columns.map((column) => printable(row[column.key])));

      if (format === "csv") {
        const csvRows = [columns.map((column) => column.label), ...matrix];
        const csv = "\uFEFF" + csvRows
          .map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(";"))
          .join("\r\n");
        downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${base}.csv`);
      }

      if (format === "json") {
        const payload = {
          metadata: {
            title,
            dataset,
            commune: context.communeName,
            generatedBy: context.generatedBy,
            generatedAt: context.generatedAt,
            rowCount: rows.length,
            scope: scopeLabel,
          },
          rows,
        };
        downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), `${base}.json`);
      }

      if (format === "xlsx") {
        const XLSX = await import("xlsx");
        const workbook = XLSX.utils.book_new();
        const metaSheet = XLSX.utils.aoa_to_sheet([
          ["e-Commune RDC — Export institutionnel"],
          ["Registre", title],
          ["Commune", context.communeName],
          ["Généré par", context.generatedBy],
          ["Date", new Date(context.generatedAt).toLocaleString("fr-CD")],
          ["Périmètre", scopeLabel],
          ["Nombre de lignes", rows.length],
        ]);
        const dataSheet = XLSX.utils.aoa_to_sheet([columns.map((column) => column.label), ...matrix]);
        dataSheet["!cols"] = columns.map((column) => ({ wch: Math.min(Math.max(column.label.length + 4, 14), 38) }));
        XLSX.utils.book_append_sheet(workbook, metaSheet, "Informations");
        XLSX.utils.book_append_sheet(workbook, dataSheet, "Données");
        XLSX.writeFile(workbook, `${base}.xlsx`, { compression: true });
      }

      if (format === "pdf") {
        const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
        const autoTable = autoTableModule.default;
        const landscape = columns.length > 6;
        const doc = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(title, 14, 16);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Commune : ${context.communeName}`, 14, 22);
        doc.text(`Généré par : ${context.generatedBy}`, 14, 27);
        doc.text(`Date : ${new Date(context.generatedAt).toLocaleString("fr-CD")} • ${rows.length} ligne(s) • ${scopeLabel}`, 14, 32);
        autoTable(doc, {
          startY: 38,
          head: [columns.map((column) => column.label)],
          body: matrix,
          styles: { fontSize: landscape ? 6.8 : 7.5, cellPadding: 1.5, overflow: "linebreak" },
          headStyles: { fontStyle: "bold" },
          margin: { left: 8, right: 8 },
        });
        doc.save(`${base}.pdf`);
      }
    } catch (exception) {
      console.error(exception);
      setError("Export impossible. Vérifiez les dépendances du module et réessayez.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="export-wrap">
      <details className="export-menu">
        <summary className="ghost-btn" aria-disabled={disabled || !rows.length || Boolean(busy)}>
          {busy ? `Export ${busy.toUpperCase()}…` : "Exporter / télécharger"}
        </summary>
        <div className="export-menu-popover">
          <button type="button" disabled={disabled || !rows.length || Boolean(busy)} onClick={() => void run("xlsx")}><strong>Excel (.xlsx)</strong><span>Classeur avec feuille d'informations</span></button>
          <button type="button" disabled={disabled || !rows.length || Boolean(busy)} onClick={() => void run("csv")}><strong>CSV (.csv)</strong><span>UTF-8, compatible Excel</span></button>
          <button type="button" disabled={disabled || !rows.length || Boolean(busy)} onClick={() => void run("pdf")}><strong>PDF (.pdf)</strong><span>État imprimable du registre</span></button>
          <button type="button" disabled={disabled || !rows.length || Boolean(busy)} onClick={() => void run("json")}><strong>JSON (.json)</strong><span>Données structurées + métadonnées</span></button>
        </div>
      </details>
      {error && <small className="export-error">{error}</small>}
    </div>
  );
}
