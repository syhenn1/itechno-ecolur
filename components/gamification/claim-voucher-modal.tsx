"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, X, Sparkles, QrCode, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { triggerButtonExplosion } from "@/lib/confetti";

export interface VoucherData {
  code: string;
  level: number;
  levelName: string;
  badgeName: string;
  badgeIcon: string;
  prize: string;
  prizeDetail?: string;
  recipientName: string;
  recipientPhone: string;
  claimedAt: string;
  expiresAt: string;
}

interface ClaimVoucherModalProps {
  voucher: VoucherData | null;
  onClose: () => void;
}

export function ClaimVoucherModal({ voucher, onClose }: ClaimVoucherModalProps) {
  const [copied, setCopied] = useState(false);

  // No SSR-mount guard needed here: `voucher` starts null and is only ever set from a
  // client-side fetch handler (see interactive-level-card.tsx), so this never attempts to
  // portal into `document.body` during a server render in the first place.
  if (!voucher) return null;

  const handleCopyCode = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerButtonExplosion(e);
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success("Kode kupon berhasil disalin!");
    setTimeout(() => setCopied(false), 2500);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-200 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime p-6 text-center text-white overflow-hidden">
          <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/20 blur-xl" />
          <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-yellow-300/30 blur-xl" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-inner mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={voucher.badgeIcon}
              alt={voucher.badgeName}
              className="h-12 w-12 object-contain drop-shadow-md animate-bounce-slow"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-0.5 text-xs font-bold text-white mb-1 shadow-xs">
            <Sparkles className="h-3 w-3 text-yellow-200" /> KLAIM HADIAH BERHASIL
          </div>

          <h2 className="text-xl font-black tracking-tight">{voucher.prize}</h2>
          <p className="text-xs text-white/80 mt-0.5">Tingkat Level {voucher.level} ({voucher.badgeName})</p>
        </div>

        {/* Voucher Ticket Body */}
        <div className="p-6 space-y-4 bg-gradient-to-b from-white to-emerald-50/30">
          {/* Voucher Card Container */}
          <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-white p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/ecolur-logo.png"
                  alt="EcoLur"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-emerald-500/20"
                />
                <div>
                  <div className="text-[11px] font-bold text-emerald-900 uppercase">E-Voucher Resmi EcoLur</div>
                  <div className="text-[9px] text-slate-500">Desa Bojong Kulur &middot; Gunung Putri</div>
                </div>
              </div>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                AKTIF
              </span>
            </div>

            {/* Recipient details */}
            <div className="grid grid-cols-2 gap-2 py-3 text-xs border-b border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px]">Penerima:</span>
                <div className="font-bold text-slate-800 truncate">{voucher.recipientName}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Nomor HP:</span>
                <div className="font-mono text-slate-800">{voucher.recipientPhone}</div>
              </div>
            </div>

            {/* Voucher Code & Action */}
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Kode Voucher Unik
                </div>
                <div className="font-mono text-base font-extrabold text-emerald-800 tracking-wider">
                  {voucher.code}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
              </button>
            </div>

            {/* Simulated QR & Expiry */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-slate-700" />
                <span>Tunjukkan kode saat penukaran</span>
              </div>
              <div>
                Berlaku s.d.{" "}
                <strong className="text-slate-700">
                  {new Date(voucher.expiresAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
          </div>

          {/* Redemption Guide */}
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>Cara Klaim / Penukaran:</strong> Untuk hadiah pulsa/voucher digital akan otomatis diproses, atau tunjukkan kode kupon di atas kepada petugas pelayanan di <strong>Kantor Desa Bojong Kulur</strong> pada hari kerja.
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                toast.success("Kupon tersimpan di akun Anda!");
                onClose();
              }}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all text-center cursor-pointer"
            >
              Selesai &amp; Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
