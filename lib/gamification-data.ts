// Pure data + math for the gamification system — no Prisma, no "server-only", safe to import
// from both server and client components.

// ---- XP amounts ----
export const XP_AMOUNTS = {
  daily_login: 15,
  daily_streak_bonus: 25,
  energy_log: 30,
  energy_saved_bonus: 50,
  report_submit: 35,
  report_resolved: 25,
  ask_ai_consultation: 10,
} as const;

export type XpEventType = keyof typeof XP_AMOUNTS;

// ---- 5 Leveling Tiers (Bronze, Silver, Gold, Ruby, Diamond) ----
export interface LevelDef {
  level: number;
  name: string;
  badgeName: "Bronze" | "Silver" | "Gold" | "Ruby" | "Diamond";
  badgeIcon: string;
  xpRequired: number;
  prize?: string;
  prizeType?: "pulsa" | "voucher" | "sembako" | "grand_prize";
  voucherCodePrefix?: string;
  prizeDetail?: string;
}

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    name: "Warga Bronze",
    badgeName: "Bronze",
    badgeIcon: "/icons/badge-bronze.png",
    xpRequired: 0,
  },
  {
    level: 2,
    name: "Warga Silver",
    badgeName: "Silver",
    badgeIcon: "/icons/badge-silver.png",
    xpRequired: 150,
    prize: "Pulsa / Token Listrik Rp15.000",
    prizeType: "pulsa",
    voucherCodePrefix: "PULSA15",
    prizeDetail: "Kode voucher digital pulsa all operator atau token listrik PLN prabayar.",
  },
  {
    level: 3,
    name: "Warga Gold",
    badgeName: "Gold",
    badgeIcon: "/icons/badge-gold.png",
    xpRequired: 400,
    prize: "Voucher Koperasi Desa Rp35.000",
    prizeType: "voucher",
    voucherCodePrefix: "KOPDES35",
    prizeDetail: "Dapat dibelanjakan di Koperasi Desa Bojong Kulur dan UMKM mitra.",
  },
  {
    level: 4,
    name: "Warga Ruby",
    badgeName: "Ruby",
    badgeIcon: "/icons/badge-ruby.png",
    xpRequired: 800,
    prize: "Paket MBG (Makan Bergizi Gratis) Ramah Lingkungan",
    prizeType: "sembako",
    voucherCodePrefix: "MBG-RUBY",
    prizeDetail: "Paket makan bergizi dan produk organik lokal dari mitra UMKM Kecamatan Gunung Putri.",
  },
  {
    level: 5,
    name: "Warga Diamond",
    badgeName: "Diamond",
    badgeIcon: "/icons/badge-diamond.png",
    xpRequired: 1500,
    prize: "Sepeda / Set Alat Hemat Energi dan Piagam Bupati",
    prizeType: "grand_prize",
    voucherCodePrefix: "DIAMOND-HERO",
    prizeDetail: "Hadiah utama fisik resmi dan piagam penghargaan Duta Keberlanjutan dari Bupati Bogor.",
  },
];

export function getLevelDef(level: number): LevelDef {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function levelForXp(xp: number): number {
  let level = 1;
  for (const def of LEVELS) {
    if (xp >= def.xpRequired) level = def.level;
  }
  return level;
}

export interface LevelProgress {
  level: number;
  name: string;
  badgeName: "Bronze" | "Silver" | "Gold" | "Ruby" | "Diamond";
  badgeIcon: string;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null; // null at max level
  progress: number; // 0-1, always 1 at max level
  nextLevel: number | null;
  nextLevelDef: LevelDef | null;
  prizeThisLevel: string | null;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const current = getLevelDef(level);
  const next = LEVELS.find((l) => l.level === level + 1) ?? null;

  if (!next) {
    return {
      level,
      name: current.name,
      badgeName: current.badgeName,
      badgeIcon: current.badgeIcon,
      xp,
      xpIntoLevel: xp - current.xpRequired,
      xpForNextLevel: null,
      progress: 1,
      nextLevel: null,
      nextLevelDef: null,
      prizeThisLevel: current.prize ?? null,
    };
  }

  const xpIntoLevel = xp - current.xpRequired;
  const xpForNextLevel = next.xpRequired - current.xpRequired;
  return {
    level,
    name: current.name,
    badgeName: current.badgeName,
    badgeIcon: current.badgeIcon,
    xp,
    xpIntoLevel,
    xpForNextLevel,
    progress: Math.min(xpIntoLevel / xpForNextLevel, 1),
    nextLevel: next.level,
    nextLevelDef: next,
    prizeThisLevel: current.prize ?? null,
  };
}

// ---- Eco Quests / Daily & Weekly Challenges ----
export interface EcoQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  iconName: "flame" | "bot" | "zap" | "camera";
  category: "daily" | "weekly" | "special";
  actionHref: string;
  actionLabel: string;
  isCompleted?: boolean;
}

export const ECO_QUESTS: EcoQuest[] = [
  {
    id: "q-daily-login",
    title: "Absensi Hijau Harian",
    description: "Klaim poin harian dengan login dan aktifkan streak hijau.",
    xpReward: 15,
    iconName: "flame",
    category: "daily",
    actionHref: "/badges",
    actionLabel: "Check-in",
  },
  {
    id: "q-ask-ai",
    title: "Konsultasi Edukasi EcoBot",
    description: "Tanyakan 1 pertanyaan seputar regulasi PLN, PLTS atap, atau hemat listrik.",
    xpReward: 10,
    iconName: "bot",
    category: "daily",
    actionHref: "/ask-ai",
    actionLabel: "Tanya EcoBot",
  },
  {
    id: "q-energy-log",
    title: "Pencatatan Listrik Bulanan",
    description: "Input meteran kWh bulan ini untuk memantau emisi karbon.",
    xpReward: 30,
    iconName: "zap",
    category: "weekly",
    actionHref: "/energy",
    actionLabel: "Input kWh",
  },
  {
    id: "q-report-issue",
    title: "Pelindung Lingkungan RT/RW",
    description: "Kirim 1 laporan fasilitas publik (jalan rusak, sampah, got mampet).",
    xpReward: 35,
    iconName: "camera",
    category: "weekly",
    actionHref: "/report",
    actionLabel: "Buat Laporan",
  },
];

// ---- Action Badges ----
export interface BadgeDef {
  type: string;
  name: string;
  description: string;
  iconName: "sprout" | "megaphone" | "star" | "trophy" | "zap" | "calendar" | "medal" | "heart";
  image?: string;
}

export const BADGE_CATALOG: BadgeDef[] = [
  { type: "pemula", name: "Warga Terdaftar", description: "Bergabung dengan komunitas EcoLur", iconName: "sprout" },
  { type: "pelapor_pertama", name: "Pelapor Pertama", description: "Mengirim laporan fasilitas kota pertama", iconName: "megaphone" },
  { type: "warga_aktif", name: "Warga Aktif", description: "Mengirim 5 laporan infrastruktur", iconName: "star" },
  { type: "pahlawan_lapor", name: "Pahlawan Lapor", description: "Mengirim 15 laporan infrastruktur", iconName: "trophy" },
  { type: "hemat_energi", name: "Hemat Energi", description: "Konsumsi kWh menurun dari bulan sebelumnya", iconName: "zap" },
  { type: "konsisten_3_bulan", name: "Konsisten 3 Bulan", description: "Mencatat konsumsi energi selama 3 bulan", iconName: "calendar" },
  { type: "konsisten_6_bulan", name: "Konsisten 6 Bulan", description: "Mencatat konsumsi energi selama 6 bulan", iconName: "medal" },
  { type: "warga_setia", name: "Warga Setia", description: "Aktif login di 10 hari berbeda", iconName: "heart" },
];

export function getBadgeDef(type: string): BadgeDef | undefined {
  return BADGE_CATALOG.find((b) => b.type === type);
}

// ---- Database Leaderboard Interface ----
export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  rtRw: string;
  xp: number;
  level: number;
  badgeName: "Bronze" | "Silver" | "Gold" | "Ruby" | "Diamond";
  badgeIcon: string;
  isCurrentUser?: boolean;
}

