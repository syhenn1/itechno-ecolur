"use client";

import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

export function RecommendationCard({ initialRecommendation }: { initialRecommendation: string }) {
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommend", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.recommendation) setRecommendation(data.recommendation);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-800">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-semibold">Rekomendasi AI</span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
        >
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} aria-hidden="true" />
          Perbarui
        </button>
      </div>
      <p className="text-sm leading-relaxed text-emerald-900">{recommendation}</p>
    </div>
  );
}
