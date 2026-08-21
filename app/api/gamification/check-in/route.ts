import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { awardXp } from "@/lib/gamification";
import { prisma } from "@/lib/db";

export const POST = withErrorHandling(async () => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await awardXp(session.userId, "daily_login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count total check-ins in the last 7 days for streak
  const recentLogins = await prisma.xpEvent.findMany({
    where: {
      userId: session.userId,
      type: "daily_login",
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  const distinctDays = new Set(recentLogins.map((e) => e.createdAt.toDateString())).size;

  if (!result.awarded) {
    return NextResponse.json({
      success: false,
      alreadyClaimed: true,
      message: "Anda sudah melakukan Absensi Hijau hari ini! Datang kembali besok untuk menjaga streak.",
      streakDays: Math.max(1, distinctDays),
    });
  }

  return NextResponse.json({
    success: true,
    alreadyClaimed: false,
    message: "Absensi Hijau Berhasil! +15 XP ditambahkan ke akun Anda.",
    xpEarned: 15,
    streakDays: Math.max(1, distinctDays),
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
  });
});
