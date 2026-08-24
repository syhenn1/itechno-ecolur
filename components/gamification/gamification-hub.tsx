"use client";

import { useState } from "react";
import { Sparkles, Target, Trophy, Award, Gift, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVELS, type LevelProgress, type LeaderboardUser } from "@/lib/gamification-data";
import { LevelProgressBar } from "./level-progress-bar";
import { DailyCheckInCard } from "./daily-check-in-card";
import { InteractiveLevelCard } from "./interactive-level-card";
import { EcoQuestsCard } from "./eco-quests-card";
import { GreenLeaderboard } from "./green-leaderboard";
import { Top3Podium } from "./top3-podium";
import { BadgeGrid } from "./badge-grid";

interface GamificationHubProps {
  progress: LevelProgress;
  user: {
    id: string;
    name: string;
    phone: string;
    xp: number;
    level: number;
  };
  claimedLevels: number[];
  earnedBadgeTypes: string[];
  leaderboardUsers?: LeaderboardUser[];
}

type TabType = "levels" | "quests" | "leaderboard" | "badges";

export function GamificationHub({
  progress,
  user,
  claimedLevels,
  earnedBadgeTypes,
  leaderboardUsers,
}: GamificationHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>("levels");
  const claimedSet = new Set(claimedLevels);

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6 overflow-hidden">
      {/* Top Banner: Progress Bar + Daily Check-In side-by-side */}
      <div className="grid gap-3 sm:gap-6 lg:grid-cols-12 items-stretch w-full min-w-0">
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between w-full min-w-0 overflow-hidden">
          <LevelProgressBar progress={progress} />
        </div>
        <div className="lg:col-span-5 flex flex-col w-full min-w-0 overflow-hidden">
          <DailyCheckInCard initialStreak={3} />
        </div>
      </div>

      {/* Segmented Tab Navigation Bar (100% Width Fit - Zero Overflow) */}
      <div className="w-full min-w-0 max-w-full rounded-2xl bg-slate-200/90 p-1 shadow-inner">
        <div className="grid grid-cols-4 gap-1 w-full min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab("levels")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 sm:px-3 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer outline-none select-none min-w-0 truncate",
              activeTab === "levels"
                ? "bg-white text-emerald-800 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Gift className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Level</span>
              <span className="hidden sm:inline">Level &amp; Hadiah</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quests")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 sm:px-3 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer outline-none select-none min-w-0 truncate",
              activeTab === "quests"
                ? "bg-white text-emerald-800 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Target className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Misi</span>
              <span className="hidden sm:inline">Misi Hijau</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leaderboard")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 sm:px-3 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer outline-none select-none min-w-0 truncate",
              activeTab === "leaderboard"
                ? "bg-white text-emerald-800 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Peringkat</span>
              <span className="hidden sm:inline">Peringkat RT/RW</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("badges")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 sm:px-3 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer outline-none select-none min-w-0 truncate",
              activeTab === "badges"
                ? "bg-white text-emerald-800 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Award className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Lencana</span>
              <span className="hidden sm:inline">Lencana ({earnedBadgeTypes.length})</span>
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-12 items-start w-full min-w-0">
        {/* Left Column: Interactive Tab Content (8 Cols on desktop, 12 on mobile) */}
        <div className="lg:col-span-8 space-y-4 w-full min-w-0 overflow-hidden">
          {/* TAB 1: Level Tiers & E-Vouchers */}
          {activeTab === "levels" && (
            <div className="space-y-3 animate-fade-in-up w-full min-w-0">
              <div className="flex items-center justify-between gap-2 px-1">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>Jenjang 5 Tingkat &amp; Hadiah Warga</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Capai akumulasi XP untuk membuka tingkat kehormatan dan klaim hadiah e-voucher resmi.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 w-full min-w-0">
                {LEVELS.map((levelDef) => (
                  <InteractiveLevelCard
                    key={levelDef.level}
                    levelDef={levelDef}
                    userLevel={user.level}
                    userXp={user.xp}
                    userName={user.name}
                    userPhone={user.phone}
                    isClaimedInitial={claimedSet.has(levelDef.level)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Quests & Active Challenges */}
          {activeTab === "quests" && (
            <div className="animate-fade-in-up w-full min-w-0">
              <EcoQuestsCard />
            </div>
          )}

          {/* TAB 3: Full RT/RW Leaderboard */}
          {activeTab === "leaderboard" && (
            <div className="animate-fade-in-up w-full min-w-0">
              <GreenLeaderboard users={leaderboardUsers} currentUserId={user.id} />
            </div>
          )}

          {/* TAB 4: Badges Showcase */}
          {activeTab === "badges" && (
            <div className="animate-fade-in-up rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xs w-full min-w-0">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-black text-slate-900">Koleksi Lencana Kehormatan</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Lencana diperoleh secara otomatis saat Anda konsisten melapor dan mencatat konsumsi energi.
                </p>
              </div>
              <BadgeGrid earnedTypes={earnedBadgeTypes} />
            </div>
          )}
        </div>

        {/* Right Column: Live Stepped Podium & RT/RW Standings (Desktop Sidebar, 4 Cols) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 w-full min-w-0">
          <Top3Podium
            users={leaderboardUsers}
            currentUserId={user.id}
            onViewFullLeaderboard={() => setActiveTab("leaderboard")}
          />

          {/* Quick Village Info Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50/40 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-xs mb-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Program Resmi Desa Bojong Kulur</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Seluruh e-voucher dan sembako MBG didanai oleh program kemitraan lingkungan dan CSR energi terbarukan Desa Bojong Kulur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
