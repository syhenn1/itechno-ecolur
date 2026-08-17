import { PrismaClient } from "@prisma/client";
// Relative import (not the "@/..." alias) — this script runs standalone via tsx, outside the
// Next.js bundler that resolves the alias.
import { estimateCost, estimateCo2 } from "../lib/energy-calc";

const prisma = new PrismaClient();

async function main() {
  // Demo citizen — matches the phone number documented in README's Usage section.
  const citizen = await prisma.user.upsert({
    where: { phone: "081234567890" },
    update: {},
    create: { phone: "081234567890", name: "Warga Demo", role: "CITIZEN", rtRw: "RT 01/RW 05" },
  });

  const months = ["2026-05", "2026-06", "2026-07", "2026-08"];
  const usageKwh = [180, 165, 172, 150];
  for (let i = 0; i < months.length; i++) {
    const consumptionKwh = usageKwh[i];
    await prisma.energyLog.upsert({
      where: { userId_period: { userId: citizen.id, period: months[i] } },
      update: {},
      create: {
        userId: citizen.id,
        period: months[i],
        consumptionKwh,
        costEstimate: estimateCost(consumptionKwh),
        co2Estimate: estimateCo2(consumptionKwh),
      },
    });
  }

  // Demo officer — a linked User (for OTP login) plus the Officer profile row that report
  // status updates get attributed to.
  const officerUser = await prisma.user.upsert({
    where: { phone: "081234567891" },
    update: {},
    create: { phone: "081234567891", name: "Petugas Demo", role: "OFFICER" },
  });
  await prisma.officer.upsert({
    where: { userId: officerUser.id },
    update: {},
    create: {
      userId: officerUser.id,
      name: officerUser.name,
      department: "Dinas Pekerjaan Umum",
      area: "Bojong Kulur",
    },
  });

  // Demo admin.
  await prisma.user.upsert({
    where: { phone: "081234567892" },
    update: {},
    create: { phone: "081234567892", name: "Admin Demo", role: "ADMIN" },
  });

  // A couple of sample reports so the officer/admin views aren't empty on first run.
  const existingReports = await prisma.report.count();
  if (existingReports === 0) {
    await prisma.report.create({
      data: {
        userId: citizen.id,
        category: "jalan_rusak",
        description:
          "Jalan berlubang cukup dalam di depan gang, sudah beberapa kali membuat pengendara motor jatuh.",
        lat: -6.441,
        lng: 106.902,
        status: "REPORTED",
        statusLogs: { create: { status: "REPORTED", notes: "Laporan dibuat oleh warga" } },
      },
    });
    await prisma.report.create({
      data: {
        userId: citizen.id,
        category: "sampah",
        description: "Tumpukan sampah di pinggir jalan tidak diangkut lebih dari seminggu, mulai berbau.",
        lat: -6.438,
        lng: 106.897,
        status: "VERIFIED",
        statusLogs: {
          create: [
            { status: "REPORTED", notes: "Laporan dibuat oleh warga" },
            { status: "VERIFIED", notes: "Sudah dicek petugas, valid" },
          ],
        },
      },
    });
  }

  console.log("Seed selesai. Akun demo (OTP dev mode selalu 000000):");
  console.log("  Warga  : 081234567890");
  console.log("  Petugas: 081234567891");
  console.log("  Admin  : 081234567892");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
