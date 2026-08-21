"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Target, Sparkles } from "lucide-react";
import { ECO_QUESTS } from "@/lib/gamification-data";

export function EcoQuestsCard() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Misi &amp; Tantangan Hijau</h3>
            <p className="text-xs text-slate-500">Selesaikan misi untuk melipatgandakan perolehan XP dan naik level lebih cepat.</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
          4 Misi Aktif
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ECO_QUESTS.map((quest) => (
          <div
            key={quest.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-4 transition-all hover:border-emerald-300 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl border border-emerald-100">
                {quest.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{quest.title}</h4>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 shrink-0">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-600" /> +{quest.xpReward} XP
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {quest.description}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {quest.category === "daily" ? "Tantangan Harian" : "Tantangan Mingguan"}
              </span>
              <Link
                href={quest.actionHref}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <span>{quest.actionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
