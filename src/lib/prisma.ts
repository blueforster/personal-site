import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Return a proxy that throws a helpful error on any method call
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (typeof prop === 'string' && prop !== 'then') {
          return new Proxy(() => {}, {
            get() {
              throw new Error(
                `DATABASE_URL is not set — cannot use prisma.${prop}`
              )
            },
            apply() {
              throw new Error(
                `DATABASE_URL is not set — cannot use prisma.${prop}()`
              )
            },
          })
        }
      },
    })
  }
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma
}
