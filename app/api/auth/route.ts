import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { authRequestSchema } from "@/lib/validations";
import {
  createOtpChallenge,
  verifyOtpChallenge,
  createSession,
  findOrCreateCitizen,
  findUserByPhone,
  getOfficerProfile,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { awardXp } from "@/lib/gamification";

export const POST = withErrorHandling(async (request: Request) => {
  const ip = getClientIp(request);
  if (!checkRateLimit(`auth:${ip}`, 15, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = authRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  }

  if (parsed.data.step === "request") {
    const { phone, name } = parsed.data;

    // Login only requires phone number. If it's a new citizen phone number, it will be automatically registered.
    const { challengeToken, devCode } = await createOtpChallenge(phone, name);
    return NextResponse.json({ challengeToken, devCode });
  }

  // step === "verify"
  const { phone, code, challengeToken } = parsed.data;
  const result = await verifyOtpChallenge(challengeToken, phone, code);
  if (!result.valid) {
    return NextResponse.json({ error: "Kode OTP salah atau kedaluwarsa" }, { status: 400 });
  }

  let user = await findUserByPhone(phone);
  if (!user) {
    const defaultName = result.name || `Warga ${phone.slice(-4)}`;
    user = await findOrCreateCitizen(phone, defaultName);
  }

  await createSession(user);

  if (user.role === "OFFICER") {
    const officer = await getOfficerProfile(user.id);
    if (!officer) {
      console.warn(`[auth] User ${user.id} has role OFFICER but no linked Officer profile — status updates will fail to attribute.`);
    }
  }

  // Gamification is a citizen-facing engagement feature — officer/admin accounts don't earn XP.
  const gamification = user.role === "CITIZEN" ? await awardXp(user.id, "daily_login") : null;

  return NextResponse.json({ ok: true, role: user.role, gamification });
});
