import { Gift, Zap } from "lucide-react";
import type { LevelProgress } from "@/lib/gamification-data";

export function LevelProgressBar({ progress }: { progress: LevelProgress }) {
  const percent = Math.round(progress.progress * 100);

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-50 border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={progress.badgeIcon} alt={progress.badgeName} className="h-10 w-10 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                Level {progress.level}: {progress.badgeName}
              </h3>
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 font-mono">
                {progress.xp} XP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {progress.nextLevelDef
                ? `Butuh ${progress.xpForNextLevel! - progress.xpIntoLevel} XP lagi menuju Level ${progress.nextLevelDef.level} (${progress.nextLevelDef.badgeName}).`
                : "Anda sudah mencapai level tertinggi (Diamond)."}
            </p>
          </div>
        </div>

        {progress.nextLevelDef && (
          <div className="hidden sm:flex flex-col items-center gap-1 bg-slate-50 border border-slate-200 p-2 rounded-md shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={progress.nextLevelDef.badgeIcon} alt={progress.nextLevelDef.badgeName} className="h-7 w-7 object-contain" />
            <span className="text-[10px] font-semibold text-slate-600 font-mono">Target Lv. {progress.nextLevelDef.level}</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Kemajuan ke level berikutnya</span>
          <span className="font-mono text-slate-600">{percent}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-700 transition-all duration-700 ease-out" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3 text-xs">
        {progress.nextLevelDef?.prize ? (
          <div className="flex items-center gap-2 text-slate-900 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white shrink-0">
              <Gift className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Hadiah level {progress.nextLevelDef.level}
              </div>
              <div className="font-semibold text-slate-900 truncate">{progress.nextLevelDef.prize}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-800">
            <span className="font-semibold">Duta Keberlanjutan Desa Jatikulur</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 shrink-0">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Aksi harian menambah XP</span>
        </div>
      </div>
    </div>
  );
}
