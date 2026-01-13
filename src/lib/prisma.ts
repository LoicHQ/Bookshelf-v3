/**
 * @agent database
 * Client Prisma avec adaptateur PostgreSQL pour Supabase
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// CrÃ©er le pool de connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// CrÃ©er l'adaptateur Prisma
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
