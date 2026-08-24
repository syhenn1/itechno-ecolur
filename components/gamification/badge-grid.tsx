"use client";

import {
  Sprout,
  Megaphone,
  Star,
  Trophy,
  Zap,
  Calendar,
  Medal,
  Heart,
  Award,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BADGE_CATALOG, type BadgeDef } from "@/lib/gamification-data";

function renderBadgeVector(iconName: BadgeDef["iconName"], earned: boolean) {
  const iconClass = cn(
    "h-6 w-6 transition-transform",
    earned ? "text-emerald-700 stroke-[2.2]" : "text-slate-400 stroke-[1.5]"
  );

  switch (iconName) {
    case "sprout":
      return <Sprout className={iconClass} />;
    case "megaphone":
      return <Megaphone className={iconClass} />;
    case "star":
      return <Star className={iconClass} />;
    case "trophy":
      return <Trophy className={iconClass} />;
    case "zap":
      return <Zap className={iconClass} />;
    case "calendar":
      return <Calendar className={iconClass} />;
    case "medal":
      return <Medal className={iconClass} />;
    case "heart":
      return <Heart className={iconClass} />;
    default:
      return earned ? <Award className={iconClass} /> : <Lock className={iconClass} />;
  }
}

function BadgeIcon({ badge, earned }: { badge: BadgeDef; earned: boolean }) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-2xs border",
        earned
          ? "bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-emerald-300 text-emerald-900 eco-glow-leaf"
          : "bg-slate-50 border-slate-200 text-slate-300 opacity-60",
      )}
    >
      {renderBadgeVector(badge.iconName, earned)}
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
              "animate-fade-in-up flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all",
              earned
                ? "border-emerald-300/80 bg-white shadow-2xs hover:border-emerald-400"
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
