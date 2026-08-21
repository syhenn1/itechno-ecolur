import type { LevelProgress } from "@/lib/gamification-data";

export function LevelProgressBar({ progress }: { progress: LevelProgress }) {
  const percent = Math.round(progress.progress * 100);

  return (
    <div className="space-y-4">
      {/* Level Info & Current Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50 border border-emerald-100 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={progress.badgeIcon}
              alt={progress.badgeName}
              className="h-10 w-10 object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Level {progress.level} &middot; {progress.badgeName}
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                {progress.xp} XP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {progress.nextLevelDef
                ? `Butuh ${progress.xpForNextLevel! - progress.xpIntoLevel} XP lagi menuju Level ${progress.nextLevelDef.level} (${progress.nextLevelDef.badgeName})`
                : "Selamat! Anda telah mencapai Rank Tertinggi (Diamond)!"}
            </p>
          </div>
        </div>

        {progress.nextLevelDef && (
          <div className="hidden sm:flex flex-col items-center gap-1 opacity-70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={progress.nextLevelDef.badgeIcon}
              alt={progress.nextLevelDef.badgeName}
              className="h-9 w-9 object-contain"
            />
            <span className="text-[10px] font-semibold text-slate-500">
              Lv. {progress.nextLevelDef.level}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar with Custom Eco Gradient */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Progress Level</span>
          <span>{percent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
