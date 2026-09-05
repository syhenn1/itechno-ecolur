"use client";

import { useState, useMemo } from "react";
import { Trophy, Crown, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LeaderboardUser } from "@/lib/gamification-data";

interface GreenLeaderboardProps {
  users?: LeaderboardUser[];
  currentUserId?: string;
}

const ITEMS_PER_PAGE = 7; // Top 1,2,3 in Podium + 7 in list = Top 10 Besar on Page 1

export function GreenLeaderboard({ users = [] }: GreenLeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const top3 = users.slice(0, 3);
  const remainingAll = users.slice(3);

  // Filtered remaining users
  const filteredRemaining = useMemo(() => {
    if (!searchQuery.trim()) return remainingAll;
    const q = searchQuery.toLowerCase();
    return remainingAll.filter(
      (u) => u.name.toLowerCase().includes(q) || u.rtRw.toLowerCase().includes(q)
    );
  }, [remainingAll, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRemaining.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredRemaining.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRemaining, effectivePage]);

  const startRank = 4 + (effectivePage - 1) * ITEMS_PER_PAGE;
  const endRank = Math.min(startRank + paginatedUsers.length - 1, users.length);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700 shrink-0">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Papan peringkat warga</h3>
            <p className="text-xs text-slate-500">Warga paling aktif dalam efisiensi energi dan laporan lingkungan di Desa Bojong Kulur.</p>
          </div>
        </div>
      </div>

      {/* Stepped Stairs Competition Podium (Top 3) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 pb-2">
        {/* Step 2: Runner Up (Left - Medium Stair) */}
        {top3[1] && (
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="flex flex-col items-center w-full pb-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={top3[1].badgeIcon}
                alt={top3[1].badgeName}
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-sm mb-1.5"
              />
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate w-full px-1" title={top3[1].name}>
                {top3[1].name}
              </h4>
              <span className="text-xs sm:text-sm font-black text-slate-800 font-mono">{top3[1].xp} XP</span>
              <span className="text-[10px] text-slate-500 truncate">{top3[1].rtRw}</span>
            </div>

            {/* Stepped Pedestal Block #2 */}
            <div className="w-full rounded-t-md bg-slate-200 border-t-4 border-slate-400 p-3 flex flex-col items-center justify-center h-20 sm:h-24">
              <span className="text-2xl sm:text-3xl font-black text-slate-700 font-mono">2</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Peringkat 2</span>
            </div>
          </div>
        )}

        {/* Step 1: Champion (Center - Tallest Golden Stair 👑) */}
        {top3[0] && (
          <div className="flex flex-col items-center text-center min-w-0 relative">
            <div className="flex flex-col items-center w-full pb-3 min-w-0">
              <div className="relative mb-1.5">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                  <Crown className="h-3.5 w-3.5" />
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={top3[0].badgeIcon}
                  alt={top3[0].badgeName}
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-md animate-bounce-slow"
                />
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 truncate w-full px-1" title={top3[0].name}>
                {top3[0].name}
              </h4>
              <span className="text-sm sm:text-base font-black text-amber-900 font-mono">{top3[0].xp} XP</span>
              <span className="text-xs font-bold text-amber-700 truncate">{top3[0].rtRw}</span>
            </div>

            {/* Stepped Pedestal Block #1 */}
            <div className="w-full rounded-t-md bg-amber-400 border-t-4 border-yellow-200 p-4 flex flex-col items-center justify-center h-28 sm:h-36 relative">
              <span className="text-3xl sm:text-4xl font-black text-amber-950 font-mono">1</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Peringkat 1</span>
            </div>
          </div>
        )}

        {/* Step 3: 3rd Place (Right - Lowest Stair) */}
        {top3[2] && (
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="flex flex-col items-center w-full pb-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={top3[2].badgeIcon}
                alt={top3[2].badgeName}
                className="h-11 w-11 sm:h-13 sm:w-13 object-contain drop-shadow-sm mb-1.5"
              />
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate w-full px-1" title={top3[2].name}>
                {top3[2].name}
              </h4>
              <span className="text-xs sm:text-sm font-black text-amber-800 font-mono">{top3[2].xp} XP</span>
              <span className="text-[10px] text-slate-500 truncate">{top3[2].rtRw}</span>
            </div>

            {/* Stepped Pedestal Block #3 */}
            <div className="w-full rounded-t-md bg-amber-100 border-t-4 border-amber-300 p-3 flex flex-col items-center justify-center h-14 sm:h-16">
              <span className="text-xl sm:text-2xl font-black text-amber-800 font-mono">3</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Peringkat 3</span>
            </div>
          </div>
        )}
      </div>

      {/* Ranks 4 s.d. 10+ Section Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Peringkat 4 s.d. 10 Besar &amp; Seluruh Warga</span>
          </h4>
          <p className="text-xs text-slate-500">
            Menampilkan peringkat {startRank}–{endRank} dari {users.length} warga terdaftar
          </p>
        </div>

        {/* Real-time search filter */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau RT/RW..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Ranks 4+ List Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-xs space-y-1.5">
        {paginatedUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Tidak ada warga yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          paginatedUsers.map((u) => (
            <div
              key={u.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl transition-all border",
                u.isCurrentUser
                  ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-slate-50/50 border-slate-200/70 hover:bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shrink-0",
                    u.rank <= 10
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  #{u.rank}
                </span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u.badgeIcon}
                  alt={u.badgeName}
                  className="h-8 w-8 object-contain shrink-0"
                />

                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    <span className="truncate">{u.name}</span>
                    {u.isCurrentUser && (
                      <span className="rounded-md bg-emerald-600 px-2 py-0.2 text-[9px] font-bold text-white shrink-0">
                        Anda
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {u.rtRw} &middot; Level {u.level} ({u.badgeName})
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span className="text-xs font-black text-slate-900 font-mono">{u.xp} XP</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 pt-2 px-1 text-xs">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={effectivePage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                  effectivePage === pageNum
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                )}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={effectivePage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
