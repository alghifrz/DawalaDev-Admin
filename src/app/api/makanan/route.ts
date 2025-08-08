import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const makanan = await prisma.makanan.findMany({
      include: {
        jenisPaket: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(makanan)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Handle foto as array of URLs
    const fotoUrls = Array.isArray(foto) ? foto : [foto]
    const fotoJson = JSON.stringify(fotoUrls)

    const makanan = await prisma.makanan.create({
      data: {
        namaMakanan,
        deskripsi,
        foto: fotoJson,
        harga,
        jenisPaketId
      },
      include: {
        jenisPaket: true
      }
    })

    return NextResponse.json(makanan, { status: 201 })
  } catch (error) {
    console.error('Error creating makanan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 