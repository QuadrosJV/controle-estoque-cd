import { PrismaClient } from "@prisma/client";

// Singleton — evita múltiplas conexões em dev com hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export async function connectDatabase(): Promise<void> {
  await db.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await db.$disconnect();
}
