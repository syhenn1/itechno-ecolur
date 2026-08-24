import "server-only";
import { prisma } from "@/lib/db";
import { XP_AMOUNTS, LEVELS, levelForXp, BADGE_CATALOG, type XpEventType, type BadgeDef } from "@/lib/gamification-data";

export interface AwardResult {
  awarded: boolean;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: BadgeDef[];
}

/** Awards XP for one action, updates the cached level, opens a PrizeClaim for any newly-reached
 *  prize level, and runs the badge-criteria check. Fully parallelized to eliminate serverless latency. */
export async function awardXp(userId: string, type: XpEventType): Promise<AwardResult> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Parallel fetch: check daily limit and get user's current XP in one concurrent roundtrip
  const [existingDaily, user] = await Promise.all([
    type === "daily_login"
      ? prisma.xpEvent.findFirst({
          where: { userId, type, createdAt: { gte: startOfDay } },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
  ]);

  if (type === "daily_login" && existingDaily !== null) {
    return { awarded: false, leveledUp: false, newBadges: [] };
  }

  const amount = XP_AMOUNTS[type];
  const newXp = user.xp + amount;
  const oldLevel = levelForXp(user.xp);
  const newLevel = levelForXp(newXp);

  await prisma.$transaction([
    prisma.xpEvent.create({ data: { userId, type, amount } }),
    prisma.user.update({ where: { id: userId }, data: { xp: newXp, level: newLevel } }),
  ]);

  if (newLevel > oldLevel) {
    const newlyReachedWithPrize = LEVELS.filter((l) => l.level > oldLevel && l.level <= newLevel && l.prize);
    if (newlyReachedWithPrize.length > 0) {
      await prisma.prizeClaim.createMany({
        data: newlyReachedWithPrize.map((l) => ({ userId, level: l.level })),
        skipDuplicates: true,
      });
    }
  }

  const newBadges = await checkAndAwardBadges(userId);

  return {
    awarded: true,
    leveledUp: newLevel > oldLevel,
    newLevel: newLevel > oldLevel ? newLevel : undefined,
    newBadges,
  };
}

/** Evaluates every badge's unlock criteria against current data concurrently using Promise.all
 *  rather than sequential roundtrips. */
export async function checkAndAwardBadges(userId: string): Promise<BadgeDef[]> {
  // Concurrently query badges, reports, energy logs, and login counts in a single batch
  const [existing, reportCount, energyLogCount, lastTwo, logins] = await Promise.all([
    prisma.badge.findMany({ where: { userId }, select: { badgeType: true } }),
    prisma.report.count({ where: { userId } }),
    prisma.energyLog.count({ where: { userId } }),
    prisma.energyLog.findMany({
      where: { userId },
      orderBy: { period: "desc" },
      take: 2,
    }),
    prisma.xpEvent.findMany({
      where: { userId, type: "daily_login" },
      select: { createdAt: true },
    }),
  ]);

  const existingTypes = new Set(existing.map((b) => b.badgeType));
  const toAward: string[] = [];

  const has = (type: string) => existingTypes.has(type) || toAward.includes(type);

  if (!has("pemula")) toAward.push("pemula");

  if (reportCount >= 1 && !has("pelapor_pertama")) toAward.push("pelapor_pertama");
  if (reportCount >= 5 && !has("warga_aktif")) toAward.push("warga_aktif");
  if (reportCount >= 15 && !has("pahlawan_lapor")) toAward.push("pahlawan_lapor");

  if (energyLogCount >= 3 && !has("konsisten_3_bulan")) toAward.push("konsisten_3_bulan");
  if (energyLogCount >= 6 && !has("konsisten_6_bulan")) toAward.push("konsisten_6_bulan");

  if (!has("hemat_energi")) {
    if (lastTwo.length === 2 && lastTwo[0].consumptionKwh < lastTwo[1].consumptionKwh) {
      toAward.push("hemat_energi");
    }
  }

  if (!has("warga_setia")) {
    const distinctDays = new Set(logins.map((e) => e.createdAt.toDateString()));
    if (distinctDays.size >= 10) toAward.push("warga_setia");
  }

  if (toAward.length === 0) return [];

  await prisma.badge.createMany({
    data: toAward.map((badgeType) => ({ userId, badgeType })),
    skipDuplicates: true,
  });

  return BADGE_CATALOG.filter((b) => toAward.includes(b.type));
}
