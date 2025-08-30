import { NextRequest, NextResponse } from 'next/server'
import { withPrisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('🔧 Creating super admin user...')

    // Check if user already exists
    const existingUser = await withPrisma(async (prisma) => {
      return await prisma.user.findUnique({
        where: { email }
      })
    })

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Super admin already exists',
        user: existingUser
      })
    }

    // Create super admin user
    const superAdmin = await withPrisma(async (prisma) => {
      return await prisma.user.create({
        data: {
          id: `super-admin-${Date.now()}`,
          email,
          role: 'SUPER_ADMIN',
          isApproved: true
        }
      })
    })

    console.log('✅ Super admin created successfully:', superAdmin.email)

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      user: superAdmin
    })

  } catch (error) {
    console.error('❌ Error creating super admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
