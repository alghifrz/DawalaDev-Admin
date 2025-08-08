import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Checking approval for user:', user.email);

    // Check if user exists in users table (approved)
    let approvedUser = null
    try {
      approvedUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })
    } catch (dbError) {
      console.error('Database error in check-approval:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (approvedUser) {
      console.log('User found in users table:', approvedUser.email, 'Role:', approvedUser.role, 'Approved:', approvedUser.isApproved)
      return NextResponse.json({
        isApproved: approvedUser.isApproved,
        role: approvedUser.role,
      })
    }

    // Check if user exists in pending_users table
    let pendingUser = null
    try {
      pendingUser = await prisma.pendingUser.findUnique({
        where: { email: user.email! },
      })
    } catch (dbError) {
      console.error('Database error checking pending user:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (pendingUser) {
      console.log('User found in pending_users table:', pendingUser.email)
      return NextResponse.json({
        isApproved: false,
        role: 'PENDING',
      })
    }

    console.log('User not found in either table:', user.email)
    return NextResponse.json({
      isApproved: false,
      role: 'NOT_FOUND',
    })

  } catch (error) {
    console.error('Error checking approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 