import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists',
        user: existingUser 
      })
    }

    // Create new user with pending approval
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        role: 'ADMIN',
        isApproved: false, // Pending approval by super admin
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: newUser 
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 