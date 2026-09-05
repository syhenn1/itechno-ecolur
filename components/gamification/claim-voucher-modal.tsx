"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, X, QrCode, ShieldCheck } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success("Kode kupon disalin");
    setTimeout(() => setCopied(false), 2500);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-md bg-white shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-slate-900 p-6 text-center text-white">
          <Button variant="glass" size="icon" onClick={onClose} aria-label="Tutup" className="absolute top-4 right-4">
            <X className="h-4 w-4" />
          </Button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-white/10 border border-white/20 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={voucher.badgeIcon} alt={voucher.badgeName} className="h-12 w-12 object-contain" />
          </div>

          <div className="text-xs font-semibold text-white/70 mb-1">Hadiah berhasil diklaim</div>
          <h2 className="text-xl font-bold tracking-tight">{voucher.prize}</h2>
          <p className="text-xs text-white/70 mt-0.5">
            Level {voucher.level} ({voucher.badgeName})
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/ecolur-logo.png" alt="EcoLur" className="h-8 w-8 rounded-md object-cover" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-900 uppercase">E-voucher EcoLur</div>
                  <div className="text-[9px] text-slate-500">Desa Bojong Kulur, Gunung Putri</div>
                </div>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 py-3 text-xs border-b border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px]">Penerima</span>
                <div className="font-semibold text-slate-800 truncate">{voucher.recipientName}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Nomor HP</span>
                <div className="font-mono text-slate-800">{voucher.recipientPhone}</div>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-md bg-slate-50 p-3 border border-slate-200">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Kode voucher</div>
                <div className="font-mono text-base font-bold text-slate-900 tracking-wider">{voucher.code}</div>
              </div>
              <Button variant="primary" size="sm" onClick={handleCopyCode}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Tersalin" : "Salin kode"}</span>
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-slate-600" />
                <span>Tunjukkan kode saat penukaran</span>
              </div>
              <div>
                Berlaku sampai{" "}
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

          <div className="flex items-start gap-2.5 rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>Cara penukaran:</strong> untuk hadiah pulsa atau voucher digital akan diproses otomatis, atau
              tunjukkan kode kupon di atas kepada petugas di Kantor Desa Bojong Kulur pada hari kerja.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => {
                toast.success("Kupon tersimpan di akun Anda");
                onClose();
              }}
            >
              Selesai
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
