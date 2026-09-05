"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { RotateCcw, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Every screen in this demo (XP, badges, energy logs, reports) writes to the real database so
 * judges can try the whole app end to end — which also means a demo session can leave the data
 * in a messy state (XP maxed out, reports spammed, prizes claimed). This button re-runs the
 * seed routine (see app/api/demo/reset/route.ts) to put every demo account back the way it
 * started, without needing terminal access to `npm run db:seed`.
 */
export function ResetDemoButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mereset data demo");

      toast.success("Data demo direset", { description: "Semua akun demo dikembalikan ke kondisi awal." });
      setOpen(false);
      // Same event the navbar's "Panduan" button dispatches — the forced tutorial (citizen) or
      // the info modal (petugas/admin) both already listen for it, so this restarts whichever
      // one applies to the current session without Reset Demo needing to know which role it is.
      window.dispatchEvent(new Event("ecolur:open-onboarding"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    // data-tutorial-allow: Reset Demo is a safety valve (see components/tutorial/tutorial-provider.tsx)
    // — always clickable even during the forced tutorial, so a demo session can always start over.
    <div data-tutorial-allow className="contents">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Reset Demo"
        title="Kembalikan data demo ke kondisi awal"
        className="px-2 text-slate-600 lg:px-3"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span className="hidden lg:inline">Reset Demo</span>
      </Button>

      {open && (
        <div
          // z-[150]: must sit above the tutorial pointer's spotlight/tooltip (z-90/z-100) — Reset
          // Demo stays clickable during the tutorial as a safety valve, but its own confirm dialog
          // should fully cover that UI while open instead of the pointer bleeding through on top.
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  <TriangleAlert className="h-4.5 w-4.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">Reset data demo?</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Tutup" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Semua akun demo (Warga Demo, Petugas Demo, Admin Demo, dan warga lain yang sudah
              diseed) akan dikembalikan ke XP, level, lencana, log energi, dan laporan awal — dan
              tutorial akan dimulai lagi dari langkah 1. Perubahan ini memengaruhi database asli
              dan tidak bisa dibatalkan.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="button" variant="warning" size="sm" onClick={handleConfirm} loading={loading}>
                {loading ? "Mereset..." : "Ya, reset sekarang"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
