import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { levelProgress, levelForXp, getLevelDef, type LeaderboardUser } from "@/lib/gamification-data";
import { GamificationHub } from "@/components/gamification/gamification-hub";
import { CompleteTutorialStepOnMount } from "@/components/tutorial/complete-step-on-mount";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function daysAgo(ms: number): Date {
  return new Date(Date.now() - ms);
}

export default async function BadgesPage() {
  const session = await getSession();
  if (!session) return null;

  const sevenDaysAgo = daysAgo(SEVEN_DAYS_MS);

  const [user, badges, prizeClaims, dbUsers, recentLogins] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { id: true, name: true, phone: true, xp: true, level: true },
    }),
    prisma.badge.findMany({ where: { userId: session.userId } }),
    prisma.prizeClaim.findMany({ where: { userId: session.userId } }),
    prisma.user.findMany({
      where: { role: "CITIZEN" },
      orderBy: { xp: "desc" },
      take: 50,
      select: { id: true, name: true, rtRw: true, xp: true },
    }),
    prisma.xpEvent.findMany({
      where: { userId: session.userId, type: "daily_login", createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const currentLevel = levelForXp(user.xp);
  const progress = levelProgress(user.xp);
  const earnedTypes = badges.map((b) => b.badgeType);
  const claimedLevels = prizeClaims.filter((c) => c.claimedAt).map((c) => c.level);

  // Same logic as app/api/gamification/check-in/route.ts: distinct login days in the last 7 days.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const distinctDays = new Set(recentLogins.map((e) => e.createdAt.toDateString())).size;
  const checkedInToday = recentLogins.some((e) => {
    const d = new Date(e.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const leaderboardUsers: LeaderboardUser[] = dbUsers.map((u, idx) => {
    const lvl = levelForXp(u.xp);
    const def = getLevelDef(lvl);
    return {
      id: u.id,
      rank: idx + 1,
      name: u.name,
      rtRw: u.rtRw || "Desa Jatikulur",
      xp: u.xp,
      level: lvl,
      badgeName: def.badgeName,
      badgeIcon: def.badgeIcon,
      isCurrentUser: u.id === session.userId,
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Level, lencana, dan hadiah</h1>
        <p className="text-sm text-slate-600 mt-1">
          Kumpulkan XP dari mencatat energi dan mengirim laporan, lalu klaim hadiah sesuai level Anda.
        </p>
      </div>

      <CompleteTutorialStepOnMount stepId="open_badges" />
      <GamificationHub
        progress={progress}
        user={{ ...user, level: currentLevel }}
        earnedBadgeTypes={earnedTypes}
        claimedLevels={claimedLevels}
        leaderboardUsers={leaderboardUsers}
        initialStreak={Math.max(1, distinctDays)}
        checkedInToday={checkedInToday}
      />
    </div>
  );
}
