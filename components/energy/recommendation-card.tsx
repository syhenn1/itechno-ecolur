"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { RefreshCw, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecommendationCard({ initialRecommendation }: { initialRecommendation: string }) {
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommend", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memperbarui rekomendasi");
      setRecommendation(data.recommendation);
      toast.success("Rekomendasi diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      {/* Same scoped gradient exception as the solar simulator's result panel — reserved for
          the app's AI-powered features so they read as a distinct "smart" surface. */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/15 text-white">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">Rekomendasi AI</span>
              <span className="rounded-md bg-white/15 px-2 py-0.2 text-[10px] font-semibold text-emerald-50">
                SDG 7
              </span>
            </div>
            <p className="text-[10px] text-emerald-100">Analisis tren konsumsi dan tips efisiensi</p>
          </div>
        </div>

        <Button type="button" variant="glass" size="sm" onClick={handleRefresh} disabled={loading} className="shrink-0">
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} aria-hidden="true" />
          <span className="hidden sm:inline">{loading ? "Menganalisis..." : "Perbarui"}</span>
        </Button>
      </div>

      <p className="text-xs sm:text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 m-5 rounded-md border border-slate-200">
        {recommendation}
      </p>
    </div>
  );
}
