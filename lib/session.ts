import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Deliberately no `import { prisma }` in this file — middleware.ts runs on the Edge runtime,
// which cannot load Prisma's Node engine. Anything DB-touching belongs in lib/auth.ts instead,
// which imports the session helpers below rather than duplicating them.

export type Role = "CITIZEN" | "OFFICER" | "ADMIN";

export interface SessionPayload {
  userId: string;
  phone: string;
  role: Role;
  name: string;
}

const SESSION_COOKIE = "ecolur_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
const OTP_LENGTH = 6;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Add it to .env — see env.example.");
  }
  return new TextEncoder().encode(secret);
}

async function hashOtp(code: string, phone: string) {
  const data = new TextEncoder().encode(`${phone}:${code}:${process.env.SESSION_SECRET}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("hex");
}

function generateOtpCode(): string {
  // Fixed demo code outside production so the app is usable (and judgeable) without a real
  // WhatsApp/SMS gateway configured — matches the demo flow documented in README.md.
  if (process.env.NODE_ENV !== "production") {
    return "000000";
  }
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

async function deliverOtp(phone: string, code: string) {
  const apiKey = process.env.OTP_PROVIDER_API_KEY;
  if (!apiKey) {
    // Development fallback — no WhatsApp/SMS gateway configured yet.
    console.log(`[dev] OTP for ${phone}: ${code}`);
    return;
  }
  // TODO: call the WhatsApp OTP gateway (e.g. Fonnte) here using OTP_PROVIDER_API_KEY.
  console.log(`[dev] OTP_PROVIDER_API_KEY is set but no gateway call is wired up yet. OTP for ${phone}: ${code}`);
}

/**
 * Stateless OTP challenge: the code's hash + expiry are embedded in a short-lived signed JWT,
 * so no database table (and no cleanup job) is needed to track pending codes. The plain code
 * is delivered out-of-band and never stored anywhere itself.
 */
export async function createOtpChallenge(phone: string, name?: string) {
  const code = generateOtpCode();
  const codeHash = await hashOtp(code, phone);
  // `name` rides along in the signed token (not a DB write) so a first-time sign-up's name
  // survives between the "request" and "verify" steps without needing server-side state.
  const challengeToken = await new SignJWT({ phone, codeHash, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${OTP_TTL_SECONDS}s`)
    .sign(getSecretKey());

  await deliverOtp(phone, code);

  return {
    challengeToken,
    // Only echoed back outside production so the UI can show a "dev OTP: 000000" hint.
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  };
}

export async function verifyOtpChallenge(
  challengeToken: string,
  phone: string,
  code: string,
): Promise<{ valid: boolean; name?: string }> {
  try {
    const { payload } = await jwtVerify(challengeToken, getSecretKey());
    if (payload.phone !== phone) return { valid: false };
    const expectedHash = await hashOtp(code, phone);
    if (payload.codeHash !== expectedHash) return { valid: false };
    return { valid: true, name: typeof payload.name === "string" ? payload.name : undefined };
  } catch {
    // Expired, malformed, or tampered token.
    return { valid: false };
  }
}

export async function createSession(user: { id: string; phone: string; role: Role; name: string }) {
  const payload: SessionPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
