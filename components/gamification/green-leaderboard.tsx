"use client";

import { Trophy, Medal, Award, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_LEADERBOARD, type LeaderboardUser } from "@/lib/gamification-data";

interface GreenLeaderboardProps {
  users?: LeaderboardUser[];
  currentUserId?: string;
}

export function GreenLeaderboard({ users = MOCK_LEADERBOARD }: GreenLeaderboardProps) {
  const top3 = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-xs">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Papan Peringkat Warga Hijau</h3>
            <p className="text-xs text-slate-500">Warga paling aktif dalam efisiensi energi &amp; laporan lingkungan di Bojong Kulur.</p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Musim 2026
        </span>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Rank 2 */}
        {top3[1] && (
          <div className="order-2 sm:order-1 rounded-3xl border border-slate-300 bg-gradient-to-b from-slate-50 via-white to-slate-50 p-4 text-center shadow-xs flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-extrabold text-slate-700 mb-2">
                #2
              </span>
              <div className="relative mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={top3[1].badgeIcon}
                  alt={top3[1].badgeName}
                  className="h-12 w-12 object-contain drop-shadow-sm"
                />
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate max-w-full">{top3[1].name}</h4>
              <span className="text-[10px] text-slate-500">{top3[1].rtRw}</span>
            </div>
            <div className="mt-3 w-full pt-2 border-t border-slate-200/80">
              <span className="text-xs font-extrabold text-slate-800 font-mono">{top3[1].xp} XP</span>
              <span className="block text-[10px] text-slate-400 font-medium">Rank {top3[1].badgeName}</span>
            </div>
          </div>
        )}

        {/* Rank 1 (Champion) */}
        {top3[0] && (
          <div className="order-1 sm:order-2 rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 p-5 text-center shadow-md eco-glow-gold flex flex-col items-center justify-between relative -mt-2">
            <div className="absolute -top-3 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-black uppercase text-white shadow-xs flex items-center gap-1">
              <Crown className="h-3 w-3" /> Peringkat 1
            </div>
            <div className="flex flex-col items-center mt-1">
              <div className="relative mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={top3[0].badgeIcon}
                  alt={top3[0].badgeName}
                  className="h-16 w-16 object-contain drop-shadow-md animate-bounce-slow"
                />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 truncate max-w-full">{top3[0].name}</h4>
              <span className="text-xs text-slate-500">{top3[0].rtRw}</span>
            </div>
            <div className="mt-3 w-full pt-2 border-t border-amber-200">
              <span className="text-sm font-black text-amber-900 font-mono">{top3[0].xp} XP</span>
              <span className="block text-xs font-bold text-amber-700">{top3[0].badgeName} Champion</span>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {top3[2] && (
          <div className="order-3 rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/30 via-white to-slate-50 p-4 text-center shadow-xs flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-extrabold text-amber-800 mb-2">
                #3
              </span>
              <div className="relative mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={top3[2].badgeIcon}
                  alt={top3[2].badgeName}
                  className="h-12 w-12 object-contain drop-shadow-sm"
                />
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate max-w-full">{top3[2].name}</h4>
              <span className="text-[10px] text-slate-500">{top3[2].rtRw}</span>
            </div>
            <div className="mt-3 w-full pt-2 border-t border-slate-200/80">
              <span className="text-xs font-extrabold text-slate-800 font-mono">{top3[2].xp} XP</span>
              <span className="block text-[10px] text-slate-400 font-medium">Rank {top3[2].badgeName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Ranks 4+ List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-xs space-y-1">
        {remaining.map((u) => (
          <div
            key={u.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-2xl transition-all",
              u.isCurrentUser
                ? "bg-emerald-50/90 border border-emerald-300 ring-2 ring-emerald-500/20"
                : "hover:bg-slate-50"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                #{u.rank}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.badgeIcon}
                alt={u.badgeName}
                className="h-8 w-8 object-contain"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{u.name}</span>
                  {u.isCurrentUser && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.2 text-[9px] font-bold text-white">
                      Anda
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">{u.rtRw} &middot; Level {u.level} ({u.badgeName})</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 font-mono">{u.xp} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
