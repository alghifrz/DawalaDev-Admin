import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 })
    }

    // Check if there's already a super admin
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    })

    if (existingSuperAdmin) {
      return NextResponse.json({ error: 'Super admin already exists' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (existingUser) {
      // Update existing user to super admin
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'SUPER_ADMIN',
          isApproved: true,
        },
      })

      return NextResponse.json({ 
        success: true, 
        message: 'User updated to super admin successfully',
        user: updatedUser 
      })
    }

    // Create new super admin
    const newSuperAdmin = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        role: 'SUPER_ADMIN',
        isApproved: true,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Super admin created successfully',
      user: newSuperAdmin 
    })

  } catch (error) {
    console.error('Error setting up super admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 