import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = globalThis.__prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Handle connection issues with retry logic
prisma.$use(async (params, next) => {
  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    try {
      return await next(params)
    } catch (error: any) {
      retries++
      
      // Check for connection issues
      if (error?.code === 'P2025' || 
          error?.message?.includes('Engine is not yet connected') ||
          error?.message?.includes('prepared statement') ||
          error?.message?.includes('already exists') ||
          error?.message?.includes('does not exist') ||
          error?.code === '42P05' ||
          error?.code === '26000') {
        
        console.log(`Database connection issue detected (attempt ${retries}/${maxRetries}), attempting to reconnect...`)
        
        try {
          // Force disconnect and reconnect
          await prisma.$disconnect()
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)) // Exponential backoff
          await prisma.$connect()
          
          // Try the query again
          continue
        } catch (reconnectError) {
          console.error('Failed to reconnect to database:', reconnectError)
          if (retries === maxRetries) {
            throw error
          }
          continue
        }
      }
      
      // If it's not a connection issue, throw immediately
      throw error
    }
  }
  
  throw new Error('Max retries exceeded')
}) 