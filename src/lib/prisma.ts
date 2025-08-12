import { PrismaClient } from '@prisma/client'

// Function to create a fresh Prisma client for each request
// Using connection string with prepared statement avoidance
export function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  
  // Add parameters to avoid prepared statement conflicts
  let connectionUrl = databaseUrl
  if (databaseUrl && databaseUrl.includes('supabase.co')) {
    const separator = databaseUrl.includes('?') ? '&' : '?'
    connectionUrl = `${databaseUrl}${separator}pgbouncer=true&connection_limit=1&pool_timeout=0`
  }
  
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
  })
}

// Create a fresh client for each database operation
export async function withPrisma<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
  const client = createPrismaClient()
  try {
    const result = await operation(client)
    return result
  } finally {
    await client.$disconnect()
  }
}

// Legacy export for backward compatibility (but will be replaced)
export const prisma = createPrismaClient() 