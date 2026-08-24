import { PrismaClient, type ReportStatus } from "@prisma/client";
// Relative imports (not the "@/..." alias) — this script runs standalone via tsx, outside the
// Next.js bundler that resolves the alias.
import { estimateCost, estimateCo2 } from "../lib/energy-calc";
import { levelForXp, LEVELS } from "../lib/gamification-data";

const prisma = new PrismaClient();

// Deliberately NOT importing lib/gamification.ts here — it starts with `import "server-only"`,
// which relies on a module resolution condition Next.js's bundler sets and plain `tsx` doesn't;
// importing it standalone fails immediately (confirmed: "Cannot find module 'server-only'").
// This is a trimmed, one-shot re-implementation of its badge-criteria check for seed purposes.
async function seedBadgesFor(userId: string) {
  const reportCount = await prisma.report.count({ where: { userId } });
  const energyLogCount = await prisma.energyLog.count({ where: { userId } });
  const lastTwo = await prisma.energyLog.findMany({ where: { userId }, orderBy: { period: "desc" }, take: 2 });

  const toAward: string[] = ["pemula"];
  if (reportCount >= 1) toAward.push("pelapor_pertama");
  if (reportCount >= 5) toAward.push("warga_aktif");
  if (reportCount >= 15) toAward.push("pahlawan_lapor");
  if (energyLogCount >= 3) toAward.push("konsisten_3_bulan");
  if (energyLogCount >= 6) toAward.push("konsisten_6_bulan");
  if (lastTwo.length === 2 && lastTwo[0].consumptionKwh < lastTwo[1].consumptionKwh) toAward.push("hemat_energi");

  await prisma.badge.createMany({
    data: toAward.map((badgeType) => ({ userId, badgeType })),
    skipDuplicates: true,
  });
}

/** Small random offset (in degrees) around a cluster center, so seeded reports look like a
 *  real, slightly-scattered neighborhood cluster instead of stacking on one exact point. */
function jitter([lat, lng]: [number, number], amountDeg: number): { lat: number; lng: number } {
  return {
    lat: lat + (Math.random() - 0.5) * 2 * amountDeg,
    lng: lng + (Math.random() - 0.5) * 2 * amountDeg,
  };
}

async function main() {
  // ---- Citizens ----
  // "Warga Demo" (081234567890) stays the primary account — it's the one documented in
  // README's demo login instructions.
  const citizenSeeds = [
    { phone: "081234567890", name: "Warga Demo", rtRw: "RT 01/RW 05" },
    { phone: "081234567893", name: "Siti Aminah", rtRw: "RT 02/RW 05" },
    { phone: "081234567894", name: "Budi Santoso", rtRw: "RT 03/RW 05" },
    { phone: "081234567895", name: "Dewi Lestari", rtRw: "RT 01/RW 06" },
    { phone: "081234567896", name: "Ahmad Fauzi", rtRw: "RT 04/RW 05" },
    { phone: "081234567897", name: "Rina Wulandari", rtRw: "RT 02/RW 06" },
  ];

  const citizens = await Promise.all(
    citizenSeeds.map((c) =>
      prisma.user.upsert({
        where: { phone: c.phone },
        update: {},
        create: { phone: c.phone, name: c.name, role: "CITIZEN", rtRw: c.rtRw },
      }),
    ),
  );
  // citizens[0] ("Warga Demo", 081234567890) stays the primary account — it's the one
  // documented in README's demo login instructions.

  // ---- Gamification: XP/level ----
  // Hand-picked rather than replayed through awardXp() — replaying real login/action history
  // isn't worth it for seed data. // Balanced across the 5 levels (Bronze, Silver, Gold, Ruby, Diamond)
  const citizenXp = [220, 80, 480, 30, 920, 1600];
  for (let i = 0; i < citizens.length; i++) {
    const xp = citizenXp[i];
    await prisma.user.update({ where: { id: citizens[i].id }, data: { xp, level: levelForXp(xp) } });
  }

  // ---- Energy logs ----
  // Different consumption trends per citizen so the AI recommendation and admin averages have
  // something varied to work with, instead of one flat number repeated everywhere.
  const months = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];
  const consumptionTrends: number[][] = [
    [210, 195, 180, 172, 150], // primaryCitizen — steadily improving
    [140, 145, 150, 158, 165], // Siti — creeping up
    [300, 295, 305, 290, 298], // Budi — flat, high baseline
    [90, 88, 95, 91, 89], // Dewi — flat, low baseline
    [175, 190, 210, 230, 250], // Ahmad — climbing fast
    [220, 200, 175, 160, 140], // Rina — improving fast
  ];

  for (let i = 0; i < citizens.length; i++) {
    const trend = consumptionTrends[i];
    for (let m = 0; m < months.length; m++) {
      const consumptionKwh = trend[m];
      await prisma.energyLog.upsert({
        where: { userId_period: { userId: citizens[i].id, period: months[m] } },
        update: {},
        create: {
          userId: citizens[i].id,
          period: months[m],
          consumptionKwh,
          costEstimate: estimateCost(consumptionKwh),
          co2Estimate: estimateCo2(consumptionKwh),
        },
      });
    }
  }

  // ---- Officer + Admin ----
  const officerUser = await prisma.user.upsert({
    where: { phone: "081234567891" },
    update: {},
    create: { phone: "081234567891", name: "Petugas Demo", role: "OFFICER" },
  });
  const officer = await prisma.officer.upsert({
    where: { userId: officerUser.id },
    update: {},
    create: {
      userId: officerUser.id,
      name: officerUser.name,
      department: "Dinas Pekerjaan Umum",
      area: "Bojong Kulur",
    },
  });

  await prisma.user.upsert({
    where: { phone: "081234567892" },
    update: {},
    create: { phone: "081234567892", name: "Admin Demo", role: "ADMIN" },
  });

  // ---- Reports ----
  // Only seed reports once — re-running `prisma db seed` shouldn't keep piling on duplicates.
  const existingReports = await prisma.report.count();
  if (existingReports > 0) {
    console.log(`Seed selesai (${existingReports} laporan sudah ada, tidak menambah lagi).`);
    return;
  }

  // Three deliberate hotspots (so the admin heatmap shows real concentration) plus scattered
  // one-off reports elsewhere in the pilot area. All centers/jitter stay inside the same
  // Bojong Kulur bounding box the citizen map is restricted to.
  // Three deliberate hotspots in Desa Bojong Kulur, Gunung Putri, Bogor
  const HOTSPOT_INTERSECTION: [number, number] = [-6.366, 106.972]; // Villa Nusa Indah intersection
  const HOTSPOT_MARKET: [number, number] = [-6.372, 106.976]; // Pasar Bojong Kulur
  const HOTSPOT_LOWLAND: [number, number] = [-6.360, 106.968]; // Bantaran Kali Cileungsi / Cikeas

  interface ReportSeed {
    category: string;
    description: string;
    center: [number, number];
    jitterDeg: number;
    status: ReportStatus;
    officerNote?: string;
  }

  const reportSeeds: ReportSeed[] = [
    // Hotspot: jalan rusak near the main intersection
    { category: "jalan_rusak", description: "Lubang besar di tengah jalan, sudah beberapa motor terjatuh saat malam hari.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.002, status: "REPORTED" },
    { category: "jalan_rusak", description: "Aspal retak dan bergelombang di dekat persimpangan, licin kalau hujan.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.002, status: "REPORTED" },
    { category: "jalan_rusak", description: "Lubang di bahu jalan semakin melebar, dekat dengan jalur pejalan kaki.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.002, status: "VERIFIED", officerNote: "Sudah dicek, kondisi cukup parah, dijadwalkan untuk perbaikan." },
    { category: "jalan_rusak", description: "Jalan berlubang membuat kemacetan karena kendaraan harus menghindar bergantian.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.0025, status: "VERIFIED", officerNote: "Valid, sudah masuk antrean perbaikan RT/RW." },
    { category: "jalan_rusak", description: "Beberapa titik jalan ambles setelah musim hujan kemarin.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.0018, status: "IN_PROGRESS", officerNote: "Material sudah didatangkan, pengerjaan mulai minggu ini." },
    { category: "jalan_rusak", description: "Lubang jalan di depan gang sudah diperbaiki sebagian bulan lalu.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.0015, status: "RESOLVED", officerNote: "Perbaikan selesai, sudah ditambal permanen." },

    // Hotspot: sampah near the market
    { category: "sampah", description: "Tumpukan sampah pasar tidak diangkut lebih dari seminggu, mulai berbau menyengat.", center: HOTSPOT_MARKET, jitterDeg: 0.0015, status: "REPORTED" },
    { category: "sampah", description: "Sampah organik dari pedagang menumpuk di pinggir jalan dekat pasar.", center: HOTSPOT_MARKET, jitterDeg: 0.0015, status: "REPORTED" },
    { category: "sampah", description: "Tempat sampah komunal penuh dan meluber ke jalan, mengundang lalat.", center: HOTSPOT_MARKET, jitterDeg: 0.002, status: "VERIFIED", officerNote: "Sudah dicek, akan dikoordinasikan dengan petugas kebersihan." },
    { category: "sampah", description: "Sampah plastik berserakan terbawa angin dari area pasar ke selokan.", center: HOTSPOT_MARKET, jitterDeg: 0.0022, status: "VERIFIED", officerNote: "Valid, jadwal angkut akan ditambah." },
    { category: "sampah", description: "Pembakaran sampah liar di belakang pasar mengganggu warga sekitar.", center: HOTSPOT_MARKET, jitterDeg: 0.0018, status: "IN_PROGRESS", officerNote: "Sudah ditegur, dipasang larangan bakar sampah." },
    { category: "sampah", description: "Area sekitar pasar sekarang lebih bersih setelah jadwal angkut ditambah.", center: HOTSPOT_MARKET, jitterDeg: 0.0012, status: "RESOLVED", officerNote: "Jadwal angkut sampah 3x seminggu sudah berjalan." },

    // Hotspot: drainase in the lowland area
    { category: "drainase", description: "Selokan tersumbat sampah, air meluap ke jalan setiap hujan deras.", center: HOTSPOT_LOWLAND, jitterDeg: 0.002, status: "REPORTED" },
    { category: "drainase", description: "Got mampet bikin genangan air di depan rumah warga.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0022, status: "REPORTED" },
    { category: "drainase", description: "Saluran air rusak dan retak, tanah di sekitarnya mulai ambles.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0018, status: "REPORTED" },
    { category: "drainase", description: "Banjir kecil di area rendah setiap kali hujan lebih dari satu jam.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0025, status: "VERIFIED", officerNote: "Terkonfirmasi, drainase perlu dikeruk total." },
    { category: "drainase", description: "Endapan lumpur tebal menyumbat aliran air ke saluran utama.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0015, status: "IN_PROGRESS", officerNote: "Pengerukan drainase sedang berjalan, estimasi selesai 2 minggu." },

    // Scattered — penerangan jalan, fasilitas umum, lainnya
    { category: "penerangan_jalan", description: "Lampu jalan mati total sejak seminggu lalu, area jadi gelap dan rawan.", center: [-6.367, 106.979], jitterDeg: 0.001, status: "REPORTED" },
    { category: "penerangan_jalan", description: "Lampu jalan menyala redup dan berkedip-kedip, kemungkinan perlu diganti.", center: [-6.375, 106.971], jitterDeg: 0.001, status: "VERIFIED", officerNote: "Sudah dicek petugas PJU, menunggu suku cadang." },
    { category: "penerangan_jalan", description: "Tiang lampu jalan miring akibat tertabrak kendaraan, berpotensi roboh.", center: [-6.363, 106.982], jitterDeg: 0.001, status: "REPORTED" },
    { category: "fasilitas_umum", description: "Ayunan di taman RW rusak dan berkarat, berbahaya untuk anak-anak.", center: [-6.369, 106.963], jitterDeg: 0.001, status: "VERIFIED", officerNote: "Valid, akan dikoordinasikan dengan karang taruna untuk perbaikan." },
    { category: "fasilitas_umum", description: "Pos ronda RT rusak atapnya, bocor saat hujan.", center: [-6.378, 106.977], jitterDeg: 0.001, status: "REPORTED" },
    { category: "fasilitas_umum", description: "Jembatan penyeberangan kecil mulai lapuk, papan kayunya sudah beberapa yang patah.", center: [-6.356, 106.971], jitterDeg: 0.001, status: "RESOLVED", officerNote: "Papan kayu sudah diganti dengan yang baru." },
    { category: "lainnya", description: "Pohon besar di pinggir jalan mulai miring, khawatir tumbang saat angin kencang.", center: [-6.374, 106.981], jitterDeg: 0.001, status: "REPORTED" },
  ];

  for (const seed of reportSeeds) {
    const { lat, lng } = jitter(seed.center, seed.jitterDeg);
    const reporter = citizens[Math.floor(Math.random() * citizens.length)];

    const statusOrder: ReportStatus[] = ["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"];
    const finalIndex = statusOrder.indexOf(seed.status);
    const statusLogs = statusOrder.slice(0, finalIndex + 1).map((status) => {
      if (status === "REPORTED") {
        return { status, notes: "Laporan dibuat oleh warga" };
      }
      return { status, notes: seed.officerNote ?? null, officerId: officer.id };
    });

    await prisma.report.create({
      data: {
        userId: reporter.id,
        category: seed.category,
        description: seed.description,
        lat,
        lng,
        status: seed.status,
        statusLogs: { create: statusLogs },
      },
    });
  }

  // ---- Badges ----
  // Runs the same criteria as lib/gamification.ts's checkAndAwardBadges (see seedBadgesFor above
  // for why it's re-implemented here instead of imported) against the energy logs/reports just
  // seeded, per citizen.
  for (const citizen of citizens) {
    await seedBadgesFor(citizen.id);
  }

  // ---- Prize claims ----
  // One row per (citizen, prize level) they've already reached — mark a couple as already
  // claimed so the badges page and the admin "Klaim Hadiah Menunggu" list both have something
  // real to show on a fresh seed, instead of every claim starting pending.
  const alreadyClaimedLevels: Record<number, number[]> = {
    0: [2], // primaryCitizen: Level 2 pulsa already given, Level 3 Kopdes voucher still pending
    5: [2, 3], // Rina: Level 2 & 3 already given, Level 4 & 5 still pending
  };

  for (let i = 0; i < citizens.length; i++) {
    const level = levelForXp(citizenXp[i]);
    const reachedPrizeLevels = LEVELS.filter((l) => l.prize && l.level <= level);
    for (const l of reachedPrizeLevels) {
      const claimed = alreadyClaimedLevels[i]?.includes(l.level) ?? false;
      await prisma.prizeClaim.upsert({
        where: { userId_level: { userId: citizens[i].id, level: l.level } },
        update: {},
        create: { userId: citizens[i].id, level: l.level, claimedAt: claimed ? new Date() : null },
      });
    }
  }

  console.log("Seed selesai:");
  console.log(`  ${citizens.length} warga, ${reportSeeds.length} laporan, ${months.length} bulan data energi/warga`);
  console.log("  Akun demo (OTP dev mode selalu 000000):");
  console.log("    Warga  : 081234567890");
  console.log("    Petugas: 081234567891");
  console.log("    Admin  : 081234567892");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
