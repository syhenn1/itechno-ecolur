import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLevelDef, levelForXp } from "@/lib/gamification-data";

export const POST = withErrorHandling(async (request: Request) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedLevel = typeof body.level === "number" ? body.level : 0;

  const levelDef = getLevelDef(requestedLevel);
  if (!levelDef || !levelDef.prize) {
    return NextResponse.json({ error: "Level ini tidak memiliki hadiah yang dapat diklaim." }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { id: true, name: true, phone: true, xp: true },
  });

  const userLevel = levelForXp(user.xp);
  if (userLevel < requestedLevel) {
    return NextResponse.json(
      { error: `XP Anda (${user.xp} XP) belum mencukupi untuk mengklaim hadiah Level ${requestedLevel} (${levelDef.xpRequired} XP).` },
      { status: 400 },
    );
  }

  // Create or update prize claim record
  const claim = await prisma.prizeClaim.upsert({
    where: { userId_level: { userId: user.id, level: requestedLevel } },
    update: {
      claimedAt: new Date(),
    },
    create: {
      userId: user.id,
      level: requestedLevel,
      claimedAt: new Date(),
    },
  });

  // Generate deterministic/unique digital voucher code
  const phoneSuffix = user.phone.slice(-4) || "0000";
  const voucherCode = `ECOLUR-${levelDef.voucherCodePrefix || "RWD"}-${phoneSuffix}-${claim.id.slice(0, 4).toUpperCase()}`;

  return NextResponse.json({
    success: true,
    claim,
    voucher: {
      code: voucherCode,
      level: requestedLevel,
      levelName: levelDef.name,
      badgeName: levelDef.badgeName,
      badgeIcon: levelDef.badgeIcon,
      prize: levelDef.prize,
      prizeDetail: levelDef.prizeDetail,
      recipientName: user.name,
      recipientPhone: user.phone,
      claimedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days valid
    },
  });
});
