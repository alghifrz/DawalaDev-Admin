import { prisma } from './prisma'

// Simple user query with retry logic
export async function safeUserQuery(userId: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Try to connect first
      await prisma.$connect()
      
      // Wait a bit to ensure connection is stable
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await prisma.user.findUnique({
        where: { id: userId },
      })
      
      return result
    } catch (error) {
      console.error(`Attempt ${attempt} failed for safeUserQuery:`, error)
      
      // Try to disconnect and reconnect
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError)
      }
      
      if (attempt === 3) {
        console.error('All attempts failed for safeUserQuery')
        return null
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  return null
}

// Simple pending user query
export async function safePendingUserQuery(email: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Try to connect first
      await prisma.$connect()
      
      // Wait a bit to ensure connection is stable
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await prisma.pendingUser.findUnique({
        where: { email },
      })
      
      return result
    } catch (error) {
      console.error(`Attempt ${attempt} failed for safePendingUserQuery:`, error)
      
      // Try to disconnect and reconnect
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError)
      }
      
      if (attempt === 3) {
        console.error('All attempts failed for safePendingUserQuery')
        return null
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  return null
}

// Simple user creation
export async function safeCreateUser(userData: {
  id: string
  email: string
  role?: string
  isApproved?: boolean
}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$connect()
      return await prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email,
          role: userData.role || 'ADMIN',
          isApproved: userData.isApproved ?? false,
        },
      })
    } catch (error) {
      console.error(`Attempt ${attempt} failed for safeCreateUser:`, error)
      if (attempt === 3) {
        console.error('All attempts failed for safeCreateUser')
        return null
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  return null
}

// Simple user update
export async function safeUpdateUserToSuperAdmin(userId: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$connect()
      return await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'SUPER_ADMIN',
          isApproved: true,
        },
      })
    } catch (error) {
      console.error(`Attempt ${attempt} failed for safeUpdateUserToSuperAdmin:`, error)
      if (attempt === 3) {
        console.error('All attempts failed for safeUpdateUserToSuperAdmin')
        return null
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  return null
}

// Simple count queries with fallbacks
export async function safePendingAdminCount(): Promise<number> {
  try {
    await prisma.$connect()
    return await prisma.pendingUser.count()
  } catch (error) {
    console.error('Error counting pending admins:', error)
    return 0
  }
}

export async function safeSuperAdminCount(): Promise<number> {
  try {
    await prisma.$connect()
    return await prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    })
  } catch (error) {
    console.error('Error counting super admins:', error)
    return 0
  }
} 