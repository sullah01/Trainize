import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "";
  const logLevels = (process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]) as any;

  // Neon's free/serverless compute suspends after a few minutes of inactivity.
  // A plain TCP connection left open across that suspend goes stale and throws
  // ("Closed" / "terminating connection due to administrator command") the next
  // time it's used. Neon's own serverless driver adapter handles the
  // suspend/resume cycle gracefully, so we use it whenever we detect a Neon
  // connection string. Local Docker Postgres doesn't need this, so it keeps
  // using the standard client.
  if (databaseUrl.includes("neon.tech")) {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter, log: logLevels });
  }

  return new PrismaClient({ log: logLevels });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
