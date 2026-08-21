"use client";

import { useState } from "react";
import { Check, Gift, Lock, Sparkles, QrCode, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type LevelDef } from "@/lib/gamification-data";
import { ClaimVoucherModal, type VoucherData } from "./claim-voucher-modal";

interface InteractiveLevelCardProps {
  levelDef: LevelDef;
  userXp: number;
  userLevel: number;
  userName: string;
  userPhone: string;
  isClaimed: boolean;
  claimedAtDate?: string | null;
}

export function InteractiveLevelCard({
  levelDef,
  userXp,
  userLevel,
  userName,
  userPhone,
  isClaimed: initialClaimed,
  claimedAtDate,
}: InteractiveLevelCardProps) {
  const [isClaimed, setIsClaimed] = useState(initialClaimed);
  const [loading, setLoading] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<VoucherData | null>(null);

  const isReached = userXp >= levelDef.xpRequired;
  const isCurrent = userLevel === levelDef.level;

  const handleClaimPrize = async () => {
    if (loading || !isReached || !levelDef.prize) return;
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
      toast.success(`Selamat! Hadiah ${levelDef.prize} berhasil Anda klaim!`, {
        icon: "🎁",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExistingVoucher = () => {
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
          "relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border p-5 transition-all overflow-hidden",
          isCurrent
            ? "border-emerald-500 bg-gradient-to-r from-emerald-50/90 via-white to-lime-50/40 shadow-md ring-2 ring-emerald-500/30"
            : isReached
              ? "border-emerald-200/90 bg-white shadow-xs hover:shadow-md"
              : "border-slate-200/80 bg-slate-50/60 opacity-80"
        )}
      >
        {/* Left Side: Badge + Description */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl p-2 transition-transform",
              isReached
                ? "bg-gradient-to-b from-white to-slate-50 shadow-sm border border-slate-100"
                : "bg-slate-100"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={levelDef.badgeIcon}
              alt={levelDef.badgeName}
              className={cn(
                "h-14 w-14 object-contain transition-all",
                !isReached && "opacity-35 grayscale"
              )}
            />
            {isCurrent && (
              <span className="absolute -top-2 -right-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                Aktif
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-extrabold text-slate-900">
                Level {levelDef.level}: {levelDef.name}
              </h4>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-600">
                {levelDef.xpRequired} XP
              </span>
            </div>

            {levelDef.prize ? (
              <div className="mt-1.5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Gift className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Hadiah: <strong className="text-emerald-800">{levelDef.prize}</strong></span>
                </div>
                {levelDef.prizeDetail && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">{levelDef.prizeDetail}</p>
                )}
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Tingkat awal warga terdaftar komunitas EcoLur</p>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          {isReached ? (
            levelDef.prize ? (
              isClaimed ? (
                <button
                  type="button"
                  onClick={handleOpenExistingVoucher}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs transition-all active:scale-95"
                >
                  <QrCode className="h-4 w-4 text-emerald-700" />
                  <span>Lihat E-Voucher</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClaimPrize}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime hover:opacity-95 text-white px-4 py-2 text-xs font-extrabold shadow-md eco-glow-leaf transition-all active:scale-95 animate-pulse-glow"
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>{loading ? "Mengklaim..." : "Klaim Hadiah Sekarang"}</span>
                </button>
              )
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <Check className="h-3.5 w-3.5" />
                Tercapai
              </span>
            )
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <Lock className="h-4 w-4" />
              <span>Terkunci (Butuh {levelDef.xpRequired - userXp} XP lagi)</span>
            </div>
          )}
        </div>
      </div>

      {/* Claim Voucher Celebration Modal */}
      <ClaimVoucherModal
        voucher={activeVoucher}
        onClose={() => setActiveVoucher(null)}
      />
    </>
  );
}
