"use client";

import Link from "next/link";
import { Trophy, Crown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LeaderboardUser } from "@/lib/gamification-data";
import { Button } from "@/components/ui/button";

interface Top3PodiumProps {
  users?: LeaderboardUser[];
  currentUserId?: string;
  showViewAllLink?: boolean;
  compact?: boolean;
  showTop10List?: boolean;
  onViewFullLeaderboard?: () => void;
}

export function Top3Podium({
  users = [],
  currentUserId,
  showViewAllLink = true,
  compact = true,
  showTop10List = true,
  onViewFullLeaderboard,
}: Top3PodiumProps) {
  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];
  const ranks4to10 = users.slice(3, 10);
  const currentUser = users.find((u) => u.isCurrentUser || u.id === currentUserId);

  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-white relative overflow-hidden",
        compact ? "p-3.5 space-y-3" : "p-5 space-y-4",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center justify-center rounded-md bg-amber-50 text-amber-700 shrink-0",
              compact ? "h-6 w-6" : "h-8 w-8",
            )}
          >
            <Trophy className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </span>
          <div>
            <h3 className={cn("font-bold text-slate-900 leading-tight", compact ? "text-xs" : "text-sm")}>
              Papan peringkat 10 besar
            </h3>
            {!compact && <p className="text-[10px] text-slate-500">Desa Jatikulur</p>}
          </div>
        </div>
      </div>

      {/* Stepped Stairs Podium (Tangga Juara Top 3) */}
      <div className={cn("grid grid-cols-3 gap-2 items-end", compact ? "pt-1" : "pt-2")}>
        {/* Step 2: Runner Up (Left - Medium Stair) */}
        {top2 && (
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="flex flex-col items-center w-full pb-1 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={top2.badgeIcon}
                alt={top2.badgeName}
                className={cn("object-contain drop-shadow-sm mb-0.5", compact ? "h-7 w-7" : "h-11 w-11")}
              />
              <h4 className="text-[10px] font-bold text-slate-800 truncate w-full px-0.5" title={top2.name}>
                {top2.name}
              </h4>
              <span className="text-[10px] font-mono font-black text-slate-700">{top2.xp} XP</span>
            </div>

            {/* Stepped Stair Block #2 */}
            <div
              className={cn(
                "w-full rounded-t-md bg-slate-200 border-t-2 border-slate-400 p-1 flex flex-col items-center justify-center",
                compact ? "h-9 sm:h-11" : "h-14 sm:h-16"
              )}
            >
              <span className={cn("font-black text-slate-700 font-mono", compact ? "text-base" : "text-xl")}>2</span>
              <span className="text-[7px] font-black uppercase tracking-wider text-slate-500">Silver</span>
            </div>
          </div>
        )}

        {/* Step 1: Champion (center, tallest stair) */}
        {top1 && (
          <div className="flex flex-col items-center text-center min-w-0 relative">
            <div className="flex flex-col items-center w-full pb-1 min-w-0">
              <div className="relative mb-0.5">
                <span className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                  <Crown className="h-2.5 w-2.5" />
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={top1.badgeIcon}
                  alt={top1.badgeName}
                  className={cn(
                    "object-contain drop-shadow-md animate-bounce-slow",
                    compact ? "h-9 w-9" : "h-13 w-13"
                  )}
                />
              </div>
              <h4 className="text-[11px] font-black text-slate-900 truncate w-full px-0.5" title={top1.name}>
                {top1.name}
              </h4>
              <span className="text-[11px] font-mono font-black text-amber-900">{top1.xp} XP</span>
            </div>

            {/* Stepped Stair Block #1 */}
            <div
              className={cn(
                "w-full rounded-t-md bg-amber-400 border-t-2 border-yellow-200 p-1 flex flex-col items-center justify-center relative",
                compact ? "h-14 sm:h-16" : "h-20 sm:h-24"
              )}
            >
              <span className={cn("font-black text-amber-950 font-mono", compact ? "text-lg" : "text-2xl")}>1</span>
              <span className="text-[7px] font-black uppercase tracking-wider text-amber-900">Champion</span>
            </div>
          </div>
        )}

        {/* Step 3: 3rd Place (Right - Lowest Stair) */}
        {top3 && (
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="flex flex-col items-center w-full pb-1 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={top3.badgeIcon}
                alt={top3.badgeName}
                className={cn("object-contain drop-shadow-sm mb-0.5", compact ? "h-6 w-6" : "h-10 w-10")}
              />
              <h4 className="text-[10px] font-bold text-slate-800 truncate w-full px-0.5" title={top3.name}>
                {top3.name}
              </h4>
              <span className="text-[10px] font-mono font-black text-amber-800">{top3.xp} XP</span>
            </div>

            {/* Stepped Stair Block #3 */}
            <div
              className={cn(
                "w-full rounded-t-md bg-amber-100 border-t-2 border-amber-300 p-1 flex flex-col items-center justify-center",
                compact ? "h-6 sm:h-8" : "h-10 sm:h-12"
              )}
            >
              <span className={cn("font-black text-amber-800 font-mono", compact ? "text-sm" : "text-lg")}>3</span>
              <span className="text-[7px] font-black uppercase tracking-wider text-amber-700">Bronze</span>
            </div>
          </div>
        )}
      </div>

      {/* Ranks 4 to 10 List (Top 10 Besar ke Bawah) */}
      {showTop10List && ranks4to10.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-amber-100">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-1">
            Peringkat #4 s.d. #10:
          </div>
          <div className="space-y-1 bg-white/80 rounded-2xl p-1.5 border border-amber-100/90">
            {ranks4to10.map((u) => (
              <div
                key={u.id}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-xl transition-all text-xs",
                  u.isCurrentUser
                    ? "bg-emerald-50 border border-emerald-300"
                    : "hover:bg-amber-50/60"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] font-black text-slate-600 shrink-0">
                    #{u.rank}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.badgeIcon}
                    alt={u.badgeName}
                    className="h-5 w-5 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold text-slate-900 truncate">
                      {u.name} {u.isCurrentUser && <span className="text-emerald-700 font-bold">(Anda)</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-1">
                  <span className="text-[11px] font-mono font-black text-slate-800">{u.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: User Rank & View All Button */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        {currentUser && (
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-slate-600">
              Posisi Anda: <strong className="text-emerald-800 font-mono font-bold">#{currentUser.rank}</strong>
            </span>
            <span className="font-mono font-extrabold text-emerald-800">{currentUser.xp} XP</span>
          </div>
        )}

        {onViewFullLeaderboard ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFullLeaderboard}
            data-tutorial-zone="view_ranking"
            className="w-full"
          >
            <span>Buka papan peringkat lengkap</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : showViewAllLink ? (
          <Link
            href="/badges"
            className="w-full text-center text-xs font-semibold text-slate-700 bg-white py-2 px-3 rounded-md border border-slate-200 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Buka papan peringkat lengkap</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
