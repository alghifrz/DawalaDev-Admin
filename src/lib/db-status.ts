import { prisma } from './prisma'

export async function checkDatabaseStatus() {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    return { isConnected: true, error: null }
  } catch (error) {
    console.error('Database connection check failed:', error)
    return { isConnected: false, error }
  }
}

export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    await prisma.$connect()
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    return fallback
  }
} 