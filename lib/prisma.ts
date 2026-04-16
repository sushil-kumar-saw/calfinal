import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export const DEFAULT_USER_ID = 'default'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null

  // Prisma v7+ requires a driver adapter for Postgres.
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export function getPrismaClient(): PrismaClient | null {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const created = createPrisma()
  if (created) globalForPrisma.prisma = created
  return created
}

// Avoid creating multiple Prisma instances during development HMR.
export async function getOrCreateDefaultUser() {
  const prisma = getPrismaClient()
  if (!prisma) return null

  // Single-user setup per requirements.
  return prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID },
  })
}

