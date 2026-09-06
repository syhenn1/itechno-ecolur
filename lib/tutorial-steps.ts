// Pure data — no "use client", safe to import from both the tutorial provider (client) and
// anywhere else that might want to read the step list without pulling in its state logic.
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  /** The page the user must be on to perform this step. */
  requiredPath: string;
  /** Label for the "go there" button shown while the user is elsewhere. */
  ctaLabel: string;
}

export type TutorialRole = "CITIZEN" | "OFFICER" | "ADMIN";

// Mirrors each role's actual core loop end to end — every step only advances when the real
// action is performed elsewhere in the app (see the `complete("...")` calls in the matching
// form/button component for each id below), never just "read this text and click Lanjut".
export const TUTORIAL_STEPS_BY_ROLE: Record<TutorialRole, TutorialStep[]> = {
  // Log real energy data, submit a real report, then experience the reward side of the
  // gamification system (open the rewards page, claim a prize, check the leaderboard) — so a
  // first-time citizen has genuinely touched every major feature once, not just read about them.
  CITIZEN: [
    {
      id: "energy_log",
      title: "Langkah 1/5 · Yuk, catat listrik bulan ini",
      description: "Isi berapa kWh yang terpakai bulan ini, terus klik Simpan. Gampang, kok!",
      requiredPath: "/energy",
      ctaLabel: "Ke halaman Energi",
    },
    {
      id: "report_submit",
      title: "Langkah 2/5 · Ada yang mau dilaporkan?",
      description: "Pilih kategorinya, ceritakan masalahnya, tandai lokasinya di peta, terus kirim deh.",
      requiredPath: "/report",
      ctaLabel: "Ke halaman Lapor",
    },
    {
      id: "open_badges",
      title: "Langkah 3/5 · Waktunya lihat hadiah kamu",
      description: "Klik menu Hadiah & Lencana buat lihat level dan hadiah yang sudah kamu kumpulkan.",
      requiredPath: "/badges",
      ctaLabel: "Ke halaman Hadiah & Lencana",
    },
    {
      id: "claim_prize",
      title: "Langkah 4/5 · Ambil hadiahnya!",
      description: "Ada hadiah menunggu di level kamu sekarang. Klik tombol Klaim hadiah, yuk.",
      requiredPath: "/badges",
      ctaLabel: "Ke halaman Hadiah & Lencana",
    },
    {
      id: "view_ranking",
      title: "Langkah 5/5 · Cek posisi kamu",
      description: "Klik tab Peringkat RT/RW buat lihat kamu ada di urutan berapa dibanding warga lain.",
      requiredPath: "/badges",
      ctaLabel: "Ke halaman Hadiah & Lencana",
    },
  ],

  // Petugas only has one working page (Laporan Masuk), so both steps live there: pick a real
  // report to open the dispatch terminal, then actually push its status forward once.
  OFFICER: [
    {
      id: "officer_select_report",
      title: "Langkah 1/2 · Pilih laporan yang mau ditangani",
      description: "Klik salah satu kartu di daftar antrean untuk membuka detail penanganannya.",
      requiredPath: "/incoming-reports",
      ctaLabel: "Ke halaman Laporan Masuk",
    },
    {
      id: "officer_update_status",
      title: "Langkah 2/2 · Perbarui status penanganan",
      description: "Di panel detail, klik tombol status berikutnya (Verifikasi/Proses/Selesaikan) untuk mencatatnya.",
      requiredPath: "/incoming-reports",
      ctaLabel: "Ke halaman Laporan Masuk",
    },
  ],

  // Admin only has one working page (Dashboard) too: generate the AI pattern summary, clear a
  // pending prize claim (auto-skipped by the provider's safety net if none happen to be
  // pending), then export the raw report data.
  ADMIN: [
    {
      id: "admin_ai_summary",
      title: "Langkah 1/3 · Buat ringkasan pola masalah",
      description: "Klik Buat Ringkasan AI untuk melihat rangkuman pola laporan warga dari kategori tertentu.",
      requiredPath: "/dashboard",
      ctaLabel: "Ke Dashboard",
    },
    {
      id: "admin_prize_claim",
      title: "Langkah 2/3 · Tandai hadiah sudah diberikan",
      description: "Kalau ada warga menunggu klaim hadiah, klik Tandai Diberikan setelah hadiah fisiknya diserahkan.",
      requiredPath: "/dashboard",
      ctaLabel: "Ke Dashboard",
    },
    {
      id: "admin_export",
      title: "Langkah 3/3 · Ekspor data laporan",
      description: "Klik Ekspor CSV untuk mengunduh seluruh data laporan sebagai file.",
      requiredPath: "/dashboard",
      ctaLabel: "Ke Dashboard",
    },
  ],
};
