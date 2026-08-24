import { Sparkles, Gift, Zap } from "lucide-react";
import type { LevelProgress } from "@/lib/gamification-data";

export function LevelProgressBar({ progress }: { progress: LevelProgress }) {
  const percent = Math.round(progress.progress * 100);

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Top: Level Info & Current Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50 border border-emerald-100 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={progress.badgeIcon}
              alt={progress.badgeName}
              className="h-10 w-10 object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900">
                Level {progress.level} &middot; {progress.badgeName}
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 font-mono">
                {progress.xp} XP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {progress.nextLevelDef
                ? `Butuh ${progress.xpForNextLevel! - progress.xpIntoLevel} XP lagi menuju Level ${progress.nextLevelDef.level} (${progress.nextLevelDef.badgeName})`
                : "Selamat! Anda telah meraih Tingkat Tertinggi (Diamond Hero)!"}
            </p>
          </div>
        </div>

        {progress.nextLevelDef && (
          <div className="hidden sm:flex flex-col items-center gap-1 bg-slate-50 border border-slate-200/70 p-2 rounded-2xl shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={progress.nextLevelDef.badgeIcon}
              alt={progress.nextLevelDef.badgeName}
              className="h-7 w-7 object-contain"
            />
            <span className="text-[10px] font-bold text-slate-600 font-mono">
              Target Lv. {progress.nextLevelDef.level}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Progress Bar with Custom Eco Gradient */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Kemajuan Menuju Level Berikutnya</span>
          <span className="font-mono text-emerald-800">{percent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Bottom: Next Level Prize Preview & Tips (Fills vertical space cleanly) */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-lime-50/50 p-3 flex items-center justify-between gap-3 text-xs">
        {progress.nextLevelDef?.prize ? (
          <div className="flex items-center gap-2 text-emerald-950 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 shadow-2xs">
              <Gift className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">
                Hadiah Level {progress.nextLevelDef.level}:
              </div>
              <div className="font-extrabold text-slate-900 truncate">
                {progress.nextLevelDef.prize}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-900">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Duta Keberlanjutan Desa Bojong Kulur</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 shrink-0">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Aksi harian menambah +15 XP</span>
        </div>
      </div>
    </div>
  );
}
