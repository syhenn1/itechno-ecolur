import "server-only";
import { prisma } from "@/lib/db";

// Node-runtime auth helpers (safe to import Prisma here). Re-export the edge-safe session
// helpers too, so API routes only need one import path: `@/lib/auth`.
export {
  createOtpChallenge,
  verifyOtpChallenge,
  createSession,
  getSession,
  destroySession,
  type SessionPayload,
  type Role,
} from "@/lib/session";

export async function findOrCreateCitizen(phone: string, name: string) {
  return prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, name, role: "CITIZEN" },
  });
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({ where: { phone } });
}

/** Resolves the Officer profile row linked to a logged-in User, if any. */
export async function getOfficerProfile(userId: string) {
  return prisma.officer.findUnique({ where: { userId } });
}
