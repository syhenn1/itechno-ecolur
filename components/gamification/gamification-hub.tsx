"use client";

import { useState } from "react";
import { Sparkles, Target, Trophy, Award, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVELS, type LevelProgress, type LeaderboardUser } from "@/lib/gamification-data";
import { LevelProgressBar } from "./level-progress-bar";
import { DailyCheckInCard } from "./daily-check-in-card";
import { InteractiveLevelCard } from "./interactive-level-card";
import { EcoQuestsCard } from "./eco-quests-card";
import { GreenLeaderboard } from "./green-leaderboard";
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
    <div className="space-y-6">
      {/* Top Banner: Progress Bar with Eco Gradient */}
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <LevelProgressBar progress={progress} />
      </div>

      {/* Daily Check-in Streak Widget */}
      <DailyCheckInCard initialStreak={3} />

      {/* Gamification Interactive Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-emerald-200/80 bg-white/80 p-1.5 shadow-2xs backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setActiveTab("levels")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap active:scale-95",
            activeTab === "levels"
              ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          )}
        >
          <Gift className="h-4 w-4" />
          <span>Level &amp; Klaim Hadiah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quests")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap active:scale-95",
            activeTab === "quests"
              ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          )}
        >
          <Target className="h-4 w-4" />
          <span>Misi &amp; Tantangan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leaderboard")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap active:scale-95",
            activeTab === "leaderboard"
              ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          )}
        >
          <Trophy className="h-4 w-4" />
          <span>Papan Peringkat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap active:scale-95",
            activeTab === "badges"
              ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          )}
        >
          <Award className="h-4 w-4" />
          <span>Koleksi Lencana ({earnedBadgeTypes.length})</span>
        </button>
      </div>

      {/* Tab Content 1: 5 Levels with In-App Claiming */}
      {activeTab === "levels" && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Jenjang 5 Tingkat &amp; Hadiah (Bronze &rarr; Diamond)
            </h3>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Klaim Langsung di Aplikasi
            </span>
          </div>

          <div className="grid gap-3">
            {LEVELS.map((lvl) => (
              <InteractiveLevelCard
                key={lvl.level}
                levelDef={lvl}
                userXp={user.xp}
                userLevel={user.level}
                userName={user.name}
                userPhone={user.phone}
                isClaimed={claimedSet.has(lvl.level)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Quests & Challenges */}
      {activeTab === "quests" && (
        <div className="animate-fade-in-up">
          <EcoQuestsCard />
        </div>
      )}

      {/* Tab Content 3: Leaderboard */}
      {activeTab === "leaderboard" && (
        <div className="animate-fade-in-up">
          <GreenLeaderboard users={leaderboardUsers} currentUserId={user.id} />
        </div>
      )}

      {/* Tab Content 4: Badges Collection */}
      {activeTab === "badges" && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-xs animate-fade-in-up space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Lencana Pencapaian Aksi Warga</h3>
            <span className="text-xs text-slate-500 font-medium">Selesaikan aksi untuk membuka lencana baru</span>
          </div>
          <BadgeGrid earnedTypes={earnedBadgeTypes} />
        </div>
      )}
    </div>
  );
}
