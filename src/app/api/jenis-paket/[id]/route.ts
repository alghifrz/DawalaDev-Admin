import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const jenisPaket = await prisma.jenisPaket.findUnique({
      where: { id },
      include: {
        makanan: true
      }
    })

    if (!jenisPaket) {
      return NextResponse.json({ error: 'Jenis paket not found' }, { status: 404 })
    }

    return NextResponse.json(jenisPaket)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const { namaPaket } = await request.json()

    if (!namaPaket) {
      return NextResponse.json(
        { error: 'Nama paket is required' },
        { status: 400 }
      )
    }

    const jenisPaket = await prisma.jenisPaket.update({
      where: { id },
      data: { namaPaket }
    })

    return NextResponse.json(jenisPaket)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Jenis paket not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Check if jenis paket has associated makanan
    const jenisPaket = await prisma.jenisPaket.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            makanan: true
          }
        }
      }
    })

    if (!jenisPaket) {
      return NextResponse.json({ error: 'Jenis paket not found' }, { status: 404 })
    }

    if (jenisPaket._count.makanan > 0) {
      return NextResponse.json(
        { error: 'Cannot delete jenis paket that has associated makanan' },
        { status: 400 }
      )
    }

    await prisma.jenisPaket.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Jenis paket deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 