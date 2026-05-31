import type { PrismaClient } from '@prisma/client'

export const DEFAULT_USER_ID = 'default'

// Store the Prisma client on globalThis to avoid multiple instances during HMR.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null

  // Lazy-require runtime Prisma packages to avoid import-time side effects during build.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const { PrismaClient: RuntimePrismaClient } = require('@prisma/client')
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const { PrismaPg } = require('@prisma/adapter-pg')

    const adapter = new PrismaPg({ connectionString })
    return new RuntimePrismaClient({ adapter })
  } catch (err) {
    // If requiring Prisma fails (missing binaries, platform mismatch), log and return null so
    // callers can fall back to mock behavior instead of crashing the build.
    console.error('Failed to initialize Prisma client:', err)
    return null
  }
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

