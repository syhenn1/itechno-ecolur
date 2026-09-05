import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { energyLogSchema } from "@/lib/validations";
import { estimateCost, estimateCo2 } from "@/lib/energy-calc";
import { checkRateLimit } from "@/lib/rate-limit";
import { awardXp } from "@/lib/gamification";

export const GET = withErrorHandling(async () => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.energyLog.findMany({
    where: { userId: session.userId },
    orderBy: { period: "asc" },
  });
  return NextResponse.json({ logs });
});

export const POST = withErrorHandling(async (request: Request) => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`energy-log:${session.userId}`, 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu sering. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = energyLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  }

  // Client only ever sends raw kWh — cost/CO2 are always derived server-side (see lib/energy-calc.ts)
  // so a citizen can't submit a fabricated cost or emissions figure.
  const { period, consumptionKwh } = parsed.data;

  // Checked before the upsert so XP is only awarded for a genuinely new period, not for
  // re-editing an already-logged month (otherwise that'd be an easy XP farm).
  const existingLog = await prisma.energyLog.findUnique({
    where: { userId_period: { userId: session.userId, period } },
    select: { id: true },
  });

  const log = await prisma.energyLog.upsert({
    where: { userId_period: { userId: session.userId, period } },
    update: {
      consumptionKwh,
      costEstimate: estimateCost(consumptionKwh),
      co2Estimate: estimateCo2(consumptionKwh),
    },
    create: {
      userId: session.userId,
      period,
      consumptionKwh,
      costEstimate: estimateCost(consumptionKwh),
      co2Estimate: estimateCo2(consumptionKwh),
    },
  });

  const gamification = existingLog ? null : await awardXp(session.userId, "energy_log");

  // `isUpdate` lets the client tell the citizen why there's no XP/celebration this time — editing
  // an already-logged month on purpose (not a bug) so it can't be farmed by resubmitting.
  return NextResponse.json({ log, gamification, isUpdate: Boolean(existingLog) }, { status: 201 });
});
