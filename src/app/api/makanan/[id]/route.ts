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

    const makanan = await prisma.makanan.findUnique({
      where: { id },
      include: {
        jenisPaket: true
      }
    })

    if (!makanan) {
      return NextResponse.json({ error: 'Makanan not found' }, { status: 404 })
    }

    return NextResponse.json(makanan)
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

    const { namaMakanan, deskripsi, foto, harga, jenisPaketId } = await request.json()

    if (!namaMakanan || !deskripsi || !foto || !harga || !jenisPaketId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate jenis paket exists
    const jenisPaket = await prisma.jenisPaket.findUnique({
      where: { id: jenisPaketId }
    })

    if (!jenisPaket) {
      return NextResponse.json(
        { error: 'Jenis paket not found' },
        { status: 400 }
      )
    }

    const makanan = await prisma.makanan.update({
      where: { id },
      data: {
        namaMakanan,
        deskripsi,
        foto,
        harga,
        jenisPaketId
      },
      include: {
        jenisPaket: true
      }
    })

    return NextResponse.json(makanan)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Makanan not found' }, { status: 404 })
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

    // Check if makanan exists
    const makanan = await prisma.makanan.findUnique({
      where: { id }
    })

    if (!makanan) {
      return NextResponse.json({ error: 'Makanan not found' }, { status: 404 })
    }

    await prisma.makanan.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Makanan deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 