import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const reports = await prisma.report.findMany();
  console.log(`Updating ${reports.length} reports to real Bojong Kulur coordinates...`);
  
  for (const r of reports) {
    // Shift latitude from ~ -6.44 to -6.3687 + small jitter
    // Shift longitude from ~ 106.89 to 106.9745 + small jitter
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    const newLat = Number((-6.3687 + latOffset).toFixed(6));
    const newLng = Number((106.9745 + lngOffset).toFixed(6));
    
    await prisma.report.update({
      where: { id: r.id },
      data: { lat: newLat, lng: newLng },
    });
  }
  
  console.log("All reports updated to Bojong Kulur (Gunung Putri, Bogor)!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
