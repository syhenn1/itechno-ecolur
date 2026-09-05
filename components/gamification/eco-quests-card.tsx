"use client";

import Link from "next/link";
import { ArrowRight, Target, Flame, Bot, Zap, Camera } from "lucide-react";
import { ECO_QUESTS, type EcoQuest } from "@/lib/gamification-data";

function renderQuestIcon(iconName: EcoQuest["iconName"]) {
  const iconClass = "h-5 w-5 text-emerald-800";
  switch (iconName) {
    case "flame":
      return <Flame className="h-5 w-5 text-orange-600" />;
    case "bot":
      return <Bot className="h-5 w-5 text-emerald-700" />;
    case "zap":
      return <Zap className="h-5 w-5 text-amber-600" />;
    case "camera":
      return <Camera className="h-5 w-5 text-sky-700" />;
    default:
      return <Target className={iconClass} />;
  }
}

export function EcoQuestsCard() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Misi &amp; Tantangan Hijau</h3>
            <p className="text-xs text-slate-500">Selesaikan misi untuk melipatgandakan perolehan XP dan naik level lebih cepat.</p>
          </div>
        </div>
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
          4 misi aktif
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ECO_QUESTS.map((quest) => (
          <div
            key={quest.id}
            className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 border border-emerald-200">
                {renderQuestIcon(quest.iconName)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{quest.title}</h4>
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                    +{quest.xpReward} XP
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
