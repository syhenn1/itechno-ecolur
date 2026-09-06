"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/components/tutorial/tutorial-provider";

interface ExportRow {
  id: string;
  category: string;
  status: string;
  description: string;
  createdAt: string;
}

function toCsv(rows: ExportRow[]): string {
  const header = ["id", "category", "status", "description", "createdAt"];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.id, r.category, r.status, r.description, r.createdAt].map((v) => escape(String(v))).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function ExportCsvButton({ rows }: { rows: ExportRow[] }) {
  const tutorial = useTutorial();

  function handleExport() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecolur-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    tutorial?.complete("admin_export");
  }

  return (
    <Button type="button" variant="outline" size="sm" data-tutorial-zone="admin_export" onClick={handleExport}>
      <Download className="h-4 w-4" aria-hidden="true" />
      Ekspor CSV
    </Button>
  );
}
