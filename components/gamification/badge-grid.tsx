"use client";

import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BADGE_CATALOG, type BadgeDef } from "@/lib/gamification-data";

function BadgeIcon({ badge, earned }: { badge: BadgeDef; earned: boolean }) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all shadow-2xs border",
        earned
          ? "bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-200 text-emerald-900"
          : "bg-slate-50 border-slate-200 text-slate-300 opacity-60 grayscale",
      )}
    >
      {badge.icon || (earned ? <Award className="h-6 w-6 text-emerald-600" /> : <Lock className="h-5 w-5" />)}
    </div>
  );
}

export function BadgeGrid({ earnedTypes }: { earnedTypes: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BADGE_CATALOG.map((badge, index) => {
        const earned = earnedTypes.includes(badge.type);
        return (
          <div
            key={badge.type}
            className={cn(
              "animate-fade-in-up flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all",
              earned
                ? "border-emerald-200 bg-white shadow-2xs"
                : "border-slate-200 bg-slate-50/50 opacity-75"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <BadgeIcon badge={badge} earned={earned} />
            <div>
              <div className={cn("text-xs font-bold", earned ? "text-slate-900" : "text-slate-500")}>
                {badge.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{badge.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
