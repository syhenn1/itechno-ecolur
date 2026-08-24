"use client";

import { useState } from "react";
import { Sparkles, Gift, QrCode, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { type LevelDef } from "@/lib/gamification-data";
import { cn } from "@/lib/utils";
import { triggerButtonExplosion } from "@/lib/confetti";
import { ClaimVoucherModal, type VoucherData } from "./claim-voucher-modal";

interface InteractiveLevelCardProps {
  levelDef: LevelDef;
  userLevel: number;
  userXp: number;
  userName: string;
  userPhone: string;
  isClaimedInitial?: boolean;
  claimedAtDate?: string;
}

export function InteractiveLevelCard({
  levelDef,
  userLevel,
  userXp,
  userName,
  userPhone,
  isClaimedInitial = false,
  claimedAtDate,
}: InteractiveLevelCardProps) {
  const [loading, setLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(isClaimedInitial);
  const [activeVoucher, setActiveVoucher] = useState<VoucherData | null>(null);

  const isReached = userLevel >= levelDef.level;
  const isCurrent = userLevel === levelDef.level;

  const handleClaimPrize = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || !isReached || !levelDef.prize) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    setLoading(true);

    try {
      const res = await fetch("/api/prize-claims/citizen-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: levelDef.level }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengklaim hadiah");
      }

      setIsClaimed(true);
      setActiveVoucher(data.voucher);
      triggerButtonExplosion(origin);
      toast.success(`Selamat! Hadiah ${levelDef.prize} berhasil Anda klaim!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExistingVoucher = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerButtonExplosion(e);
    const phoneSuffix = userPhone.slice(-4) || "0000";
    const voucherCode = `ECOLUR-${levelDef.voucherCodePrefix || "RWD"}-${phoneSuffix}-LV${levelDef.level}`;

    setActiveVoucher({
      code: voucherCode,
      level: levelDef.level,
      levelName: levelDef.name,
      badgeName: levelDef.badgeName,
      badgeIcon: levelDef.badgeIcon,
      prize: levelDef.prize || "Hadiah Level",
      prizeDetail: levelDef.prizeDetail,
      recipientName: userName,
      recipientPhone: userPhone,
      claimedAt: claimedAtDate || new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border p-3.5 sm:p-4 transition-all duration-150",
          isCurrent
            ? "border-emerald-500 bg-gradient-to-r from-emerald-50/80 via-white to-lime-50/40 shadow-xs ring-1 ring-emerald-500/30"
            : isReached
            ? "border-slate-200 bg-white shadow-2xs hover:border-emerald-300"
            : "border-slate-200/80 bg-slate-50/70 opacity-80"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Side: Icon + Level Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl p-1",
                  isReached ? "bg-white shadow-2xs border border-slate-100" : "bg-slate-200/60 grayscale"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={levelDef.badgeIcon}
                  alt={levelDef.badgeName}
                  className={cn("h-7 w-7 sm:h-9 sm:w-9 object-contain", isCurrent && "animate-bounce-slow")}
                />
              </div>
              {isCurrent && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 ring-2 ring-white">
                  <Sparkles className="h-2 w-2 text-white" />
                </span>
              )}
            </div>

            <div className="min-w-0 leading-snug">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{levelDef.name}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-slate-600 font-mono">
                  {levelDef.xpRequired} XP
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.2 text-[8px] sm:text-[9px] font-extrabold text-white">
                    Level Anda
                  </span>
                )}
              </div>

              {levelDef.prize ? (
                <div className="text-[11px] sm:text-xs font-semibold text-emerald-900 flex items-center gap-1 mt-0.5 truncate">
                  <Gift className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{levelDef.prize}</span>
                </div>
              ) : (
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Tingkat Awal Warga Baru</div>
              )}
            </div>
          </div>

          {/* Right Side: Action CTA Button */}
          <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {isReached ? (
              levelDef.prize ? (
                isClaimed ? (
                  <button
                    type="button"
                    onClick={handleOpenExistingVoucher}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs active:scale-95 transition-all outline-none cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Lihat E-Voucher</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClaimPrize}
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime text-white px-3.5 py-1.5 text-xs font-extrabold shadow-md eco-glow-leaf active:scale-95 transition-all animate-pulse-glow outline-none cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                    <span>{loading ? "..." : "Klaim Hadiah"}</span>
                  </button>
                )
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                  <Check className="h-3 w-3 stroke-[3]" />
                  Tercapai
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Lock className="h-3 w-3" />
                <span>-{levelDef.xpRequired - userXp} XP</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Claim Voucher Modal */}
      <ClaimVoucherModal voucher={activeVoucher} onClose={() => setActiveVoucher(null)} />
    </>
  );
}
