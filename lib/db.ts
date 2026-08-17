import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton: without this, every hot-reload would open a fresh
// PrismaClient (and a fresh pool of DB connections) without closing the old one.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
