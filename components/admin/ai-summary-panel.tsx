"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/components/tutorial/tutorial-provider";

const CATEGORIES = [
  { value: "all", label: "Semua Kategori" },
  { value: "jalan_rusak", label: "Jalan Rusak" },
  { value: "sampah", label: "Sampah" },
  { value: "drainase", label: "Drainase" },
  { value: "penerangan_jalan", label: "Penerangan Jalan" },
  { value: "fasilitas_umum", label: "Fasilitas Umum" },
];

export function AiSummaryPanel() {
  const tutorial = useTutorial();
  const [category, setCategory] = useState("all");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category === "all" ? undefined : category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat ringkasan");
      setSummary(data.summary);
      tutorial?.complete("admin_ai_summary");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div data-tutorial-zone="admin_ai_summary" className="flex flex-col gap-2 sm:flex-row">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <Button type="button" onClick={handleGenerate} loading={loading}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Buat Ringkasan AI
        </Button>
      </div>
      {summary && (
        <p className="animate-fade-in-up rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {summary}
        </p>
      )}
    </div>
  );
}
