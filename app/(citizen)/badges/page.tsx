import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { levelProgress, levelForXp, getLevelDef, type LeaderboardUser } from "@/lib/gamification-data";
import { GamificationHub } from "@/components/gamification/gamification-hub";

export default async function BadgesPage() {
  const session = await getSession();
  if (!session) return null;

  const [user, badges, prizeClaims, dbUsers] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { id: true, name: true, phone: true, xp: true, level: true },
    }),
    prisma.badge.findMany({ where: { userId: session.userId } }),
    prisma.prizeClaim.findMany({ where: { userId: session.userId } }),
    prisma.user.findMany({
      where: { role: "CITIZEN" },
      orderBy: { xp: "desc" },
      take: 10,
      select: { id: true, name: true, rtRw: true, xp: true },
    }),
  ]);

  const currentLevel = levelForXp(user.xp);
  const progress = levelProgress(user.xp);
  const earnedTypes = badges.map((b) => b.badgeType);
  const claimedLevels = prizeClaims.filter((c) => c.claimedAt).map((c) => c.level);

  // Map real database leaderboard
  const leaderboardUsers: LeaderboardUser[] = dbUsers.map((u, idx) => {
    const lvl = levelForXp(u.xp);
    const def = getLevelDef(lvl);
    return {
      id: u.id,
      rank: idx + 1,
      name: u.name,
      rtRw: u.rtRw || "Bojong Kulur",
      xp: u.xp,
      level: lvl,
      badgeName: def.badgeName,
      badgeIcon: def.badgeIcon,
      isCurrentUser: u.id === session.userId,
    };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pusat Hadiah &amp; Gamifikasi Warga
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Kumpulkan XP dari aksi hemat energi &amp; laporan kota, klaim voucher hadiah resmi, dan raih peringkat tertinggi di Bojong Kulur!
        </p>
      </div>

      <GamificationHub
        progress={progress}
        user={{ ...user, level: currentLevel }}
        claimedLevels={claimedLevels}
        earnedBadgeTypes={earnedTypes}
        leaderboardUsers={leaderboardUsers}
      />
    </div>
  );
}
