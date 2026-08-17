import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`auth:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = authRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  }

  if (parsed.data.step === "request") {
    const { phone, name } = parsed.data;

    // Only citizens can self-register through this form — Officer/Admin accounts are seeded/
    // created ahead of time. An unrecognized phone number with no `name` is rejected rather
    // than silently becoming a new account.
    const existing = await findUserByPhone(phone);
    if (!existing && !name) {
      return NextResponse.json(
        { error: "Nomor belum terdaftar. Isi nama untuk membuat akun warga baru." },
        { status: 400 },
      );
    }

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
    user = await findOrCreateCitizen(phone, result.name ?? "Warga");
  }

  await createSession(user);

  if (user.role === "OFFICER") {
    const officer = await getOfficerProfile(user.id);
    if (!officer) {
      console.warn(`[auth] User ${user.id} has role OFFICER but no linked Officer profile — status updates will fail to attribute.`);
    }
  }

  return NextResponse.json({ ok: true, role: user.role });
}
