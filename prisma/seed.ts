import { PrismaClient } from "@prisma/client";
import { seedDemoData } from "./seed-logic";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding database cepat Desa Bojong Kulur...");

  const result = await seedDemoData(prisma);

  console.log("Seeding database berhasil (Parallel & High Speed):");
  console.log(`  - ${result.citizens} Warga Terdaftar (RT 01 s.d RT 08 Bojong Kulur)`);
  console.log(`  - ${result.energyLogs} Log Energi Bulanan`);
  console.log(`  - ${result.reports} Laporan Infrastruktur & Kebersihan`);
  console.log(`  - ${result.badges} Lencana Penghargaan Warga`);
  console.log(`  - ${result.prizeClaims} Tiket Klaim Hadiah`);
  console.log(`  - ${result.wasteLogs} Catatan Bank Sampah`);
  console.log(`  - ${result.mobilityLogs} Catatan Mobilitas Jejak Karbon`);
  console.log("  - Akun Demo Aktif (OTP 000000):");
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
