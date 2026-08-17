import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { energyLogSchema } from "@/lib/validations";
import { estimateCost, estimateCo2 } from "@/lib/energy-calc";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.energyLog.findMany({
    where: { userId: session.userId },
    orderBy: { period: "asc" },
  });
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
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

  return NextResponse.json({ log }, { status: 201 });
}
