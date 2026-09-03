"use client";

import { Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LeaderboardUser } from "@/lib/gamification-data";

interface MiniLeaderboardProps {
  users?: LeaderboardUser[];
  onViewFull?: () => void;
}

export function MiniLeaderboard({
  users = [],
  onViewFull,
}: MiniLeaderboardProps) {
  const topUsers = users.slice(0, 5);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-xs">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Top Warga Hijau</h3>
            <p className="text-[10px] text-slate-500">Peringkat keaktifan RT/RW</p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
          Musim 2026
        </span>
      </div>

      <div className="space-y-1.5">
        {topUsers.map((u, index) => {
          const rank = index + 1;
          const isTop1 = rank === 1;
          const isTop2 = rank === 2;
          const isTop3 = rank === 3;

          return (
            <div
              key={u.id}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-2xl transition-all border",
                u.isCurrentUser
                  ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20"
                  : isTop1
                    ? "bg-amber-50/60 border-amber-200/90 hover:bg-amber-50"
                    : "bg-slate-50/50 border-slate-200/70 hover:bg-white"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black",
                    isTop1
                      ? "bg-amber-500 text-white shadow-xs"
                      : isTop2
                        ? "bg-slate-300 text-slate-800"
                        : isTop3
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200/80 text-slate-600"
                  )}
                >
                  #{rank}
                </span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u.badgeIcon}
                  alt={u.badgeName}
                  className="h-7 w-7 object-contain shrink-0"
                />

                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                    <span className="truncate">{u.name}</span>
                    {u.isCurrentUser && (
                      <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 text-[8px] font-bold text-white shrink-0">
                        Anda
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {u.rtRw} &middot; {u.badgeName}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className="text-xs font-black text-slate-900 font-mono">{u.xp}</span>
                <span className="text-[9px] text-slate-400 block -mt-0.5">XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {onViewFull && (
        <button
          type="button"
          onClick={onViewFull}
          className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-900 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Lihat Podium Lengkap</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
