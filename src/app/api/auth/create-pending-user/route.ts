import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, authProvider } = await request.json()

    if (!email || !name || !authProvider) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Creating pending user:', { email, name, authProvider })

    // Check if user already exists in users table
    let existingUser = null
    try {
      // Disconnect first to clear any existing connections
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.log('Error disconnecting (expected):', disconnectError)
      }

      await prisma.$connect()
      
      existingUser = await prisma.user.findUnique({
        where: { email },
      })
      
      await prisma.$disconnect()
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError)
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError)
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      console.log('User already exists in users table:', existingUser.email)
      return NextResponse.json({ 
        error: 'User already exists',
        user: existingUser 
      }, { status: 409 })
    }

    // Check if user already exists in pending_users table
    let existingPendingUser = null
    try {
      await prisma.$connect()
      
      existingPendingUser = await prisma.pendingUser.findUnique({
        where: { email },
      })
      
      await prisma.$disconnect()
    } catch (dbError) {
      console.error('Database error checking existing pending user:', dbError)
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError)
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingPendingUser) {
      console.log('User already exists in pending_users table:', existingPendingUser.email)
      return NextResponse.json({ 
        error: 'User already pending approval',
        pendingUser: existingPendingUser 
      }, { status: 409 })
    }

    // Create new pending user
    let newPendingUser = null
    try {
      await prisma.$connect()
      
      newPendingUser = await prisma.pendingUser.create({
        data: {
          email,
          name,
          authProvider,
        },
      })
      
      await prisma.$disconnect()
    } catch (dbError) {
      console.error('Database error creating pending user:', dbError)
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError)
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('Successfully created pending user:', newPendingUser.email)
    return NextResponse.json({ 
      success: true,
      message: 'Pending user created successfully',
      pendingUser: newPendingUser 
    })

  } catch (error) {
    console.error('Error creating pending user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 