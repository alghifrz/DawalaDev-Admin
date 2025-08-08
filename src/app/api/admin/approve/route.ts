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

    // Check if current user is super admin
    let currentUser = null
    try {
      try { await prisma.$disconnect() } catch {}
      await prisma.$connect()
      currentUser = await prisma.user.findUnique({ where: { id: user.id } })
      await prisma.$disconnect()
    } catch (err) {
      try { await prisma.$disconnect() } catch {}
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only Super Admin can approve users' }, { status: 403 })
    }

    const { pendingUserId } = await request.json()
    
    if (!pendingUserId) {
      return NextResponse.json({ error: 'Pending user ID is required' }, { status: 400 })
    }

    console.log('Approving pending user:', pendingUserId)

    // Get pending user
    let pendingUser = null
    try {
      await prisma.$connect()
      pendingUser = await prisma.pendingUser.findUnique({ where: { id: pendingUserId } })
      await prisma.$disconnect()
    } catch (err) {
      try { await prisma.$disconnect() } catch {}
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!pendingUser) {
      console.log('Pending user not found:', pendingUserId)
      return NextResponse.json({ error: 'Pending user not found' }, { status: 404 })
    }

    console.log('Found pending user:', pendingUser.email, 'Provider:', pendingUser.authProvider)

    // Check if user already exists in users table
    let existingUser = null
    try {
      await prisma.$connect()
      existingUser = await prisma.user.findUnique({ where: { email: pendingUser.email } })
      await prisma.$disconnect()
    } catch (err) {
      try { await prisma.$disconnect() } catch {}
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      console.log('User already exists in users table:', existingUser.email)
      // If user exists but is not approved, approve them
      if (!existingUser.isApproved) {
        console.log('Approving existing unapproved user:', existingUser.email)
        let updatedUser = null
        try {
          await prisma.$connect()
          updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: { isApproved: true },
          })
          await prisma.pendingUser.delete({ where: { id: pendingUserId } })
          await prisma.$disconnect()
        } catch (err) {
          try { await prisma.$disconnect() } catch {}
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }
        return NextResponse.json({ 
          success: true, 
          message: `User ${pendingUser.email} berhasil disetujui`,
          user: updatedUser
        })
      }
      // If user exists and is already approved, just remove from pending
      try {
        await prisma.$connect()
        await prisma.pendingUser.delete({ where: { id: pendingUserId } })
        await prisma.$disconnect()
      } catch (err) {
        try { await prisma.$disconnect() } catch {}
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
      return NextResponse.json({ 
        success: true, 
        message: `User ${pendingUser.email} sudah disetujui sebelumnya`,
        user: existingUser
      })
    }

    // Create new user
    let newUser = null
    try {
      await prisma.$connect()
      newUser = await prisma.user.create({
        data: {
          id: pendingUser.id, // Use the same ID as pending user
          email: pendingUser.email,
          name: pendingUser.name,
          role: 'ADMIN',
          isApproved: true,
        },
      })
      await prisma.pendingUser.delete({ where: { id: pendingUserId } })
      await prisma.$disconnect()
    } catch (err) {
      try { await prisma.$disconnect() } catch {}
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${pendingUser.email} berhasil disetujui dan dipindahkan ke tabel user`,
      user: newUser
    })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 