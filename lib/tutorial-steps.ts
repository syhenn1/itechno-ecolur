// Pure data — no "use client", safe to import from both the tutorial provider (client) and
// anywhere else that might want to read the step list without pulling in its state logic.
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  /** The page the citizen must be on to perform this step. */
  requiredPath: string;
  /** Label for the "go there" button shown while the citizen is elsewhere. */
  ctaLabel: string;
}

// Mirrors the app's actual core loop end to end: log real energy data, submit a real report,
// then experience the reward side of the gamification system (open the rewards page, claim a
// prize, check the leaderboard) — so a first-time demo user has genuinely touched every major
// feature once, not just read about them.
export const TUTORIAL_STEPS: TutorialStep[] = [
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
];
