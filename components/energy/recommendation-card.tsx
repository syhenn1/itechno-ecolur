"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Sparkles, Bot, Zap } from "lucide-react";

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
      toast.success("Rekomendasi hemat energi berhasil diperbarui!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-lime-50/50 to-white p-6 shadow-sm eco-glow-leaf transition-all hover:shadow-md">
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 h-28 w-28 rounded-full bg-lime-300/20 blur-2xl pointer-events-none" />

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-eco-forest to-eco-leaf text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-emerald-950">Rekomendasi Cerdas AI</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                SDG 7
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Analisis tren konsumsi &amp; tips efisiensi</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs transition-all hover:bg-emerald-50 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} aria-hidden="true" />
          <span>{loading ? "Menganalisis..." : "Perbarui"}</span>
        </button>
      </div>

      <p key={recommendation} className="animate-fade-in-up text-xs sm:text-sm leading-relaxed text-emerald-950/90 bg-white/70 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200/60 shadow-2xs">
        {recommendation}
      </p>
    </div>
  );
}
