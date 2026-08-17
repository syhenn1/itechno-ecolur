import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reportCreateSchema } from "@/lib/validations";
import { uploadReportPhoto } from "@/lib/supabase";
import { classifyReportCategory } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";

  const reports = await prisma.report.findMany({
    where: mine ? { userId: session.userId } : undefined,
    include: { statusLogs: { orderBy: { updatedAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`report:${session.userId}`, 10, 60_000)) {
    return NextResponse.json({ error: "Terlalu sering. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });

  const parsed = reportCreateSchema.safeParse({
    category: formData.get("category"),
    description: formData.get("description"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  }

  let photoUrl: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran foto maksimal 5MB" }, { status: 400 });
    }
    try {
      photoUrl = await uploadReportPhoto(photo);
    } catch (error) {
      // Don't block report submission just because Storage isn't configured yet (e.g. local dev
      // without SUPABASE_SERVICE_ROLE_KEY set) — the report is still valuable without a photo.
      console.error("[reports.create] Photo upload failed:", error);
    }
  }

  const { category, description, lat, lng } = parsed.data;

  // Best-effort AI category suggestion — only consulted when the citizen picked "lainnya"
  // (other), and never blocks submission if the call fails.
  const finalCategory = category === "lainnya" ? ((await classifyReportCategory(description)) ?? category) : category;

  const report = await prisma.report.create({
    data: {
      userId: session.userId,
      category: finalCategory,
      description,
      photoUrl,
      lat,
      lng,
      status: "REPORTED",
      statusLogs: {
        create: { status: "REPORTED", notes: "Laporan dibuat oleh warga" },
      },
    },
    include: { statusLogs: true },
  });

  return NextResponse.json({ report }, { status: 201 });
}
