import { PrismaClient } from "@prisma/client";
import { levelForXp } from "../lib/gamification-data";

const prisma = new PrismaClient();

async function main() {
  // Let's set Warga Demo (081234567890) to 220 XP (Level 2 Silver) so they have an active progress bar
  await prisma.user.updateMany({
    where: { phone: "081234567890" },
    data: { xp: 220, level: 2 },
  });

  const users = await prisma.user.findMany();
  for (const u of users) {
    const level = levelForXp(u.xp);
    await prisma.user.update({
      where: { id: u.id },
      data: { level },
    });
  }

  const updated = await prisma.user.findMany({ select: { name: true, phone: true, xp: true, level: true } });
  console.log("Updated Users:", updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
