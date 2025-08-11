import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add robust middleware for prepared statement errors
prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (error: any) {
    // Check for prepared statement errors
    if (error?.message?.includes('prepared statement') ||
        error?.code === '42P05' ||
        error?.code === '26000') {
      
      console.log('Prepared statement error detected, attempting recovery...')
      
      try {
        // Force disconnect and reconnect
        await prisma.$disconnect()
        
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reconnect
        await prisma.$connect()
        
        console.log('Recovery successful, retrying query...')
        
        // Retry the query
        return await next(params)
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError)
        throw error
      }
    }
    
    throw error
  }
})

// Add retry logic for prepared statement errors
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a prepared statement error
      if (error?.message?.includes('prepared statement') ||
          error?.code === '42P05' ||
          error?.code === '26000') {
        
        console.log(`Prepared statement error on attempt ${attempt}, retrying...`)
        
        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
      }
      
      // For other errors or max retries reached, throw immediately
      throw error
    }
  }
  
  throw lastError
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
}) 