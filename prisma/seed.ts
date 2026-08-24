import { PrismaClient, type ReportStatus } from "@prisma/client";
import { estimateCost, estimateCo2 } from "../lib/energy-calc";
import { levelForXp, LEVELS } from "../lib/gamification-data";

const prisma = new PrismaClient();

function jitter([lat, lng]: [number, number], amountDeg: number): { lat: number; lng: number } {
  return {
    lat: lat + (Math.random() - 0.5) * 2 * amountDeg,
    lng: lng + (Math.random() - 0.5) * 2 * amountDeg,
  };
}

async function main() {
  console.log("Memulai proses seeding database cepat Desa Bojong Kulur...");

  // ---- 32 Diverse Citizens across RT 01 s.d RT 08 / RW 01 s.d RW 06 ----
  const citizenSeeds = [
    { phone: "081234567890", name: "Warga Demo", rtRw: "RT 01/RW 05", xp: 480 },
    { phone: "081234567801", name: "Haji Sukardi", rtRw: "RT 03/RW 02", xp: 2450 },
    { phone: "081234567802", name: "Rina Wulandari", rtRw: "RT 02/RW 06", xp: 1820 },
    { phone: "081234567803", name: "Bambang Pamungkas", rtRw: "RT 01/RW 03", xp: 1540 },
    { phone: "081234567804", name: "Ahmad Fauzi", rtRw: "RT 04/RW 05", xp: 1210 },
    { phone: "081234567805", name: "Siti Nurhaliza", rtRw: "RT 02/RW 01", xp: 980 },
    { phone: "081234567806", name: "Budi Santoso", rtRw: "RT 03/RW 05", xp: 850 },
    { phone: "081234567807", name: "Dewi Lestari", rtRw: "RT 01/RW 06", xp: 720 },
    { phone: "081234567808", name: "Hendra Kusuma", rtRw: "RT 05/RW 02", xp: 630 },
    { phone: "081234567809", name: "Ratna Sari", rtRw: "RT 02/RW 04", xp: 550 },
    { phone: "081234567810", name: "Agus Setiawan", rtRw: "RT 04/RW 03", xp: 490 },
    { phone: "081234567811", name: "Maya Anggraini", rtRw: "RT 01/RW 02", xp: 410 },
    { phone: "081234567812", name: "Eko Prasetyo", rtRw: "RT 03/RW 04", xp: 380 },
    { phone: "081234567813", name: "Tri Wahyuni", rtRw: "RT 06/RW 01", xp: 350 },
    { phone: "081234567814", name: "Dedi Supriadi", rtRw: "RT 02/RW 03", xp: 310 },
    { phone: "081234567815", name: "Sri Mulyani", rtRw: "RT 04/RW 06", xp: 290 },
    { phone: "081234567816", name: "Wahyu Hidayat", rtRw: "RT 01/RW 04", xp: 270 },
    { phone: "081234567817", name: "Nurul Hidayah", rtRw: "RT 05/RW 05", xp: 240 },
    { phone: "081234567818", name: "Rizky Ramadhan", rtRw: "RT 02/RW 02", xp: 210 },
    { phone: "081234567819", name: "Fitri Handayani", rtRw: "RT 03/RW 01", xp: 190 },
    { phone: "081234567820", name: "Gunawan Wibisono", rtRw: "RT 07/RW 03", xp: 175 },
    { phone: "081234567821", name: "Lestari Indah", rtRw: "RT 01/RW 01", xp: 160 },
    { phone: "081234567822", name: "Doni Hermawan", rtRw: "RT 04/RW 04", xp: 145 },
    { phone: "081234567823", name: "Endah Puspita", rtRw: "RT 02/RW 05", xp: 130 },
    { phone: "081234567824", name: "Fajar Nugraha", rtRw: "RT 05/RW 06", xp: 115 },
    { phone: "081234567825", name: "Gita Permata", rtRw: "RT 03/RW 02", xp: 100 },
    { phone: "081234567826", name: "Hadi Purnomo", rtRw: "RT 06/RW 04", xp: 85 },
    { phone: "081234567827", name: "Indra Pratama", rtRw: "RT 01/RW 05", xp: 70 },
    { phone: "081234567828", name: "Joko Widodo", rtRw: "RT 04/RW 02", xp: 60 },
    { phone: "081234567829", name: "Kartika Sari", rtRw: "RT 02/RW 01", xp: 50 },
    { phone: "081234567830", name: "Lukman Hakim", rtRw: "RT 08/RW 03", xp: 40 },
    { phone: "081234567831", name: "Mega Utami", rtRw: "RT 03/RW 06", xp: 30 },
  ];

  // Parallel Upsert Citizens
  const citizens = await Promise.all(
    citizenSeeds.map((c) =>
      prisma.user.upsert({
        where: { phone: c.phone },
        update: {
          name: c.name,
          rtRw: c.rtRw,
          xp: c.xp,
          level: levelForXp(c.xp),
        },
        create: {
          phone: c.phone,
          name: c.name,
          role: "CITIZEN",
          rtRw: c.rtRw,
          xp: c.xp,
          level: levelForXp(c.xp),
        },
      })
    )
  );

  // Parallel Upsert Officer + Admin
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
      department: "Dinas Pekerjaan Umum & Lingkungan",
      area: "Bojong Kulur",
    },
  });

  await prisma.user.upsert({
    where: { phone: "081234567892" },
    update: {},
    create: { phone: "081234567892", name: "Admin Demo", role: "ADMIN" },
  });

  // Batch Energy Logs
  const months = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];
  const energyLogsData: Array<{
    userId: string;
    period: string;
    consumptionKwh: number;
    costEstimate: number;
    co2Estimate: number;
  }> = [];

  for (let i = 0; i < citizens.length; i++) {
    const baseKwh = 120 + (i % 8) * 25;
    for (let m = 0; m < months.length; m++) {
      const consumptionKwh = Math.max(60, Math.round(baseKwh - m * 8 + ((i + m) % 5) * 3));
      energyLogsData.push({
        userId: citizens[i].id,
        period: months[m],
        consumptionKwh,
        costEstimate: estimateCost(consumptionKwh),
        co2Estimate: estimateCo2(consumptionKwh),
      });
    }
  }

  // Delete & Re-insert bulk energy logs
  await prisma.energyLog.deleteMany({});
  await prisma.energyLog.createMany({
    data: energyLogsData,
    skipDuplicates: true,
  });

  // Delete & Re-insert Reports & Status Logs
  await prisma.reportStatusLog.deleteMany({});
  await prisma.report.deleteMany({});

  const HOTSPOT_INTERSECTION: [number, number] = [-6.366, 106.972]; // Villa Nusa Indah intersection
  const HOTSPOT_MARKET: [number, number] = [-6.372, 106.976]; // Pasar Bojong Kulur
  const HOTSPOT_LOWLAND: [number, number] = [-6.360, 106.968]; // Bantaran Kali Cileungsi

  interface ReportSeed {
    category: string;
    description: string;
    center: [number, number];
    jitterDeg: number;
    status: ReportStatus;
    officerNote?: string;
  }

  const reportSeeds: ReportSeed[] = [
    // Hotspot 1: Jalan Rusak
    { category: "jalan_rusak", description: "Lubang besar di jalan utama RW 05, membahayakan pengendara motor saat malam.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.002, status: "REPORTED" },
    { category: "jalan_rusak", description: "Aspal retak dan bergelombang di dekat persimpangan pasar, licin saat hujan.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.002, status: "REPORTED" },
    { category: "jalan_rusak", description: "Bahu jalan amblas sedalam 30cm dekat jembatan penghubung RT 02.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.002, status: "VERIFIED", officerNote: "Sudah disurvei tim lapangan, material aspal hotmix dijadwalkan." },
    { category: "jalan_rusak", description: "Jalan berlubang membuat antrean kemacetan panjang di jam sibuk warga.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.0025, status: "VERIFIED", officerNote: "Valid, masuk prioritas pemeliharaan jalan desa." },
    { category: "jalan_rusak", description: "Paving block trotoar terangkat akar pohon besar, mengganggu pejalan kaki.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.0018, status: "IN_PROGRESS", officerNote: "Sedang dilakukan penataan akar dan perapian paving." },
    { category: "jalan_rusak", description: "Lubang jalan depan kantor posyandu sudah ditambal dengan baik.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.0015, status: "RESOLVED", officerNote: "Pekerjaan penambalan selesai 100% dan sudah dapat dilalui." },
    { category: "jalan_rusak", description: "Genangan air merusak lapisan aspal di gang mawar RT 04.", center: HOTSPOT_INTERSECTION, jitterDeg: 0.002, status: "RESOLVED", officerNote: "Aspal baru dan resapan air telah diperbaiki." },

    // Hotspot 2: Sampah & Kebersihan
    { category: "sampah", description: "Tumpukan sampah plastik liar di lahan kosong belakang pertokoan.", center: HOTSPOT_MARKET, jitterDeg: 0.0015, status: "REPORTED" },
    { category: "sampah", description: "Tempat pembuangan sampah sementara meluap hingga ke badan jalan.", center: HOTSPOT_MARKET, jitterDeg: 0.0015, status: "REPORTED" },
    { category: "sampah", description: "Warga membuang puing bangunan di pinggir jalan alternatif RW 03.", center: HOTSPOT_MARKET, jitterDeg: 0.002, status: "VERIFIED", officerNote: "Sudah dipasang garis pembatas dan jadwal truk pengangkut." },
    { category: "sampah", description: "Sampah pasar organik menumpuk dan menimbulkan bau tidak sedap.", center: HOTSPOT_MARKET, jitterDeg: 0.0022, status: "IN_PROGRESS", officerNote: "Armada truk sampah DLH sedang mengangkut ke TPA." },
    { category: "sampah", description: "Area pembuangan sampah liar sudah dibersihkan dan dipasang spanduk larangan.", center: HOTSPOT_MARKET, jitterDeg: 0.0018, status: "RESOLVED", officerNote: "Pembersihan total selesai bersama warga kerja bakti." },
    { category: "sampah", description: "Saluran selokan pasar yang tersumbat plastik sudah dikeruk bersih.", center: HOTSPOT_MARKET, jitterDeg: 0.0012, status: "RESOLVED", officerNote: "Drainase lancar kembali, sampah diangkut tuntas." },

    // Hotspot 3: Drainase & Saluran Air
    { category: "drainase", description: "Saluran air tersumbat endapan lumpur tebal, memicu luapan air saat hujan deras.", center: HOTSPOT_LOWLAND, jitterDeg: 0.002, status: "REPORTED" },
    { category: "drainase", description: "Tutup gorong-gorong beton pecah tergilas truk pengangkut material.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0022, status: "VERIFIED", officerNote: "Tutup gorong-gorong baru sedang dicetak." },
    { category: "drainase", description: "Tanggul saluran primer retak dan berpotensi jebol jika debit air naik.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0018, status: "IN_PROGRESS", officerNote: "Pemasangan bronjong kawat penahan tanggul sedang berlangsung." },
    { category: "drainase", description: "Pengerukan lumpur got sepanjang 200 meter di RW 06 telah tuntas.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0025, status: "RESOLVED", officerNote: "Aliran air normal menuju saluran pembuangan utama." },
    { category: "drainase", description: "Pintu air otomatis bantaran kali telah diminyaki dan berfungsi normal.", center: HOTSPOT_LOWLAND, jitterDeg: 0.0015, status: "RESOLVED", officerNote: "Uji coba buka-tutup pintu air sukses." },

    // Scattered: Penerangan Jalan & Fasilitas Umum
    { category: "penerangan_jalan", description: "Lampu penerangan jalan utama mati total sepanjang 100 meter di RW 01.", center: [-6.367, 106.979], jitterDeg: 0.001, status: "REPORTED" },
    { category: "penerangan_jalan", description: "Kabel lampu PJU terkelupas dan menjuntai dekat pohon rindang.", center: [-6.375, 106.971], jitterDeg: 0.001, status: "VERIFIED", officerNote: "Kabel diamankan petugas PLN & desa." },
    { category: "penerangan_jalan", description: "Penggantian 5 unit lampu LED hemat energi di jalan RW 04 selesai.", center: [-6.363, 106.982], jitterDeg: 0.001, status: "RESOLVED", officerNote: "Lampu menyala terang dan efisien." },
    { category: "fasilitas_umum", description: "Pagar taman bermain balita di posyandu RT 03 patah.", center: [-6.369, 106.963], jitterDeg: 0.001, status: "VERIFIED", officerNote: "Telah dikoordinasikan untuk pengelasan ulang." },
    { category: "fasilitas_umum", description: "Renovasi pos kamling dan pengecatan ulang pos ronda RW 02 telah selesai.", center: [-6.378, 106.977], jitterDeg: 0.001, status: "RESOLVED", officerNote: "Pos ronda siap digunakan kembali untuk siskamling." },
    { category: "lainnya", description: "Ranting pohon peneduh jalan dipangkas karena menutupi rambu lalu lintas.", center: [-6.374, 106.981], jitterDeg: 0.001, status: "RESOLVED", officerNote: "Pemangkasan selesai, jarak pandang aman." },
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

  // Bulk Badges
  const badgesData: Array<{ userId: string; badgeType: string }> = [];
  for (const citizen of citizens) {
    badgesData.push({ userId: citizen.id, badgeType: "pemula" });
    if (citizen.xp >= 150) badgesData.push({ userId: citizen.id, badgeType: "pelapor_pertama" });
    if (citizen.xp >= 400) badgesData.push({ userId: citizen.id, badgeType: "warga_aktif" });
    if (citizen.xp >= 700) badgesData.push({ userId: citizen.id, badgeType: "konsisten_3_bulan" });
    if (citizen.xp >= 1200) badgesData.push({ userId: citizen.id, badgeType: "hemat_energi" });
    if (citizen.xp >= 1800) badgesData.push({ userId: citizen.id, badgeType: "pahlawan_lapor" });
  }
  await prisma.badge.deleteMany({});
  await prisma.badge.createMany({
    data: badgesData,
    skipDuplicates: true,
  });

  // Bulk Prize Claims
  const claimsData: Array<{ userId: string; level: number; claimedAt: Date | null }> = [];
  for (const citizen of citizens) {
    const level = levelForXp(citizen.xp);
    const reachedPrizeLevels = LEVELS.filter((l) => l.prize && l.level <= level);
    for (const l of reachedPrizeLevels) {
      const isClaimed = l.level < level;
      claimsData.push({
        userId: citizen.id,
        level: l.level,
        claimedAt: isClaimed ? new Date() : null,
      });
    }
  }
  await prisma.prizeClaim.deleteMany({});
  await prisma.prizeClaim.createMany({
    data: claimsData,
    skipDuplicates: true,
  });

  console.log("Seeding database berhasil (Parallel & High Speed):");
  console.log(`  ✓ ${citizens.length} Warga Terdaftar (RT 01 s.d RT 08 Bojong Kulur)`);
  console.log(`  ✓ ${energyLogsData.length} Log Energi Bulanan`);
  console.log(`  ✓ ${reportSeeds.length} Laporan Infrastruktur & Kebersihan`);
  console.log(`  ✓ ${badgesData.length} Lencana Penghargaan Warga`);
  console.log(`  ✓ ${claimsData.length} Tiket Klaim Hadiah`);
  console.log("  ✓ Akun Demo Aktif (OTP 000000):");
  console.log("    - Warga   : 081234567890 (Warga Demo)");
  console.log("    - Petugas : 081234567891");
  console.log("    - Admin   : 081234567892");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
