"use client";

import { useEffect, useState } from "react";
import { X, Zap, MapPin, Trophy, Sparkles, ShieldAlert, BarChart3, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Role = "CITIZEN" | "OFFICER" | "ADMIN";

interface Step {
  icon: typeof Zap;
  title: string;
  body: string;
}

const STEPS: Record<Role, Step[]> = {
  CITIZEN: [
    {
      icon: Sparkles,
      title: "Selamat datang di EcoLur",
      body: "EcoLur membantu warga Bojong Kulur mencatat konsumsi listrik dan melaporkan masalah infrastruktur di sekitar rumah. Setiap aktivitas yang Anda lakukan di sini mengumpulkan XP.",
    },
    {
      icon: Zap,
      title: "Catat konsumsi listrik bulanan",
      body: "Buka menu Energi, masukkan angka kWh dari meteran atau tagihan PLN Anda. Anda akan mendapat rekomendasi hemat energi dari AI dan XP setiap kali mencatat.",
    },
    {
      icon: MapPin,
      title: "Laporkan masalah di lingkungan",
      body: "Buka menu Lapor & Riwayat untuk melaporkan jalan rusak, sampah, drainase, atau masalah lain. Tandai lokasinya di peta, tambahkan foto, lalu pantau status penanganannya oleh petugas.",
    },
    {
      icon: Trophy,
      title: "Naik level, dapatkan hadiah",
      body: "Semakin aktif mencatat energi dan melapor, XP Anda bertambah dan level naik dari Bronze hingga Diamond. Setiap level punya hadiah nyata seperti pulsa, voucher koperasi, hingga sepeda.",
    },
    {
      icon: Sparkles,
      title: "Butuh bantuan?",
      body: "Tanya EcoBot di menu Tanya AI kapan saja untuk pertanyaan seputar hemat energi atau regulasi panel surya. Panduan ini bisa dibuka lagi lewat tombol Panduan di pojok kanan atas.",
    },
  ],
  OFFICER: [
    {
      icon: Sparkles,
      title: "Selamat datang, Petugas",
      body: "Akun Anda bertugas memverifikasi dan menindaklanjuti laporan warga Bojong Kulur seputar infrastruktur dan kebersihan lingkungan.",
    },
    {
      icon: ShieldAlert,
      title: "Pantau laporan masuk",
      body: "Menu Laporan Masuk menampilkan daftar dan peta laporan warga, diurutkan berdasarkan kedekatan lokasi dan tingkat urgensi agar penanganan lebih terarah.",
    },
    {
      icon: MapPin,
      title: "Perbarui status penanganan",
      body: "Buka satu laporan, lalu ubah statusnya secara berurutan: Dilaporkan, Diverifikasi, Diproses, hingga Selesai. Setiap perubahan status dicatat sebagai riwayat lengkap beserta catatan Anda.",
    },
  ],
  ADMIN: [
    {
      icon: Sparkles,
      title: "Selamat datang, Admin",
      body: "Dashboard ini merangkum data energi dan laporan infrastruktur seluruh warga Bojong Kulur untuk mendukung pengambilan keputusan pemerintah desa.",
    },
    {
      icon: BarChart3,
      title: "Baca data agregat dan peta sebaran",
      body: "Pantau tren konsumsi energi warga, tingkat penyelesaian laporan, serta peta sebaran titik masalah untuk mengenali area yang perlu perhatian lebih.",
    },
    {
      icon: Gift,
      title: "Kelola klaim hadiah warga",
      body: "Saat warga menukarkan hadiah level (pulsa, voucher, sepeda, dan lainnya), tandai klaimnya sebagai selesai di dashboard setelah hadiah fisik diserahkan.",
    },
  ],
};

function storageKey(role: Role) {
  return `ecolur_onboarding_seen_${role.toLowerCase()}_v1`;
}

export function OnboardingTour({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = STEPS[role];

  useEffect(() => {
    // Reading localStorage can only happen once mounted in the browser (it doesn't exist during
    // SSR, so this can't be computed in a lazy useState initializer without a hydration
    // mismatch) — this is a one-time read from an external system at mount, not state derived
    // from other React state, so the direct setState call here is the legitimate case the rule
    // itself carves out.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!window.localStorage.getItem(storageKey(role))) setOpen(true);
    } catch {
      // localStorage unavailable (private mode / disabled) — just skip auto-showing, the
      // Panduan button in the navbar still opens the tour on demand.
    }

    function handleReopen() {
      setStepIndex(0);
      setOpen(true);
    }
    window.addEventListener("ecolur:open-onboarding", handleReopen);
    return () => window.removeEventListener("ecolur:open-onboarding", handleReopen);
  }, [role]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(storageKey(role), "1");
    } catch {
      // Ignore — worst case the tour reappears next visit, which is harmless.
    }
  }

  if (!open) return null;

  const step = steps[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white">
            <Icon className="h-5 w-5" />
          </span>
          <Button variant="ghost" size="icon" onClick={close} aria-label="Tutup panduan" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="mt-3 text-base font-bold text-slate-900">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={cn("h-1.5 w-1.5 rounded-full", i === stepIndex ? "bg-emerald-700" : "bg-slate-200")}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStepIndex((i) => i - 1)}>
                Kembali
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => (isLast ? close() : setStepIndex((i) => i + 1))}
            >
              {isLast ? "Mulai" : "Lanjut"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
