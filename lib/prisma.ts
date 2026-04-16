// Re-triggering Prisma generation and singleton refresh
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "@prisma/client";


declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  try {
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST || "localhost",
      user: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD || "",
      database: process.env.DATABASE_NAME || "online_food_ordering",
      connectionLimit: 3,
    });
    
    const client = new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
    
    return client;
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw error;
  }
};

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();



export { prisma };

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}