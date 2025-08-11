import { prisma } from './prisma'

export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)

      // Check if it's a connection-related error
      const isConnectionError = 
        error instanceof Error && (
          error.message.includes('prepared statement') ||
          error.message.includes('bind message supplies') ||
          error.message.includes('08P01') ||
          error.message.includes('connection') ||
          error.message.includes('timeout')
        )

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Attempting to reconnect (attempt ${attempt}/${maxRetries})...`)
        try {
          await prisma.$disconnect()
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          await prisma.$connect()
          console.log('Reconnected successfully')
        } catch (reconnectError) {
          console.error('Failed to reconnect:', reconnectError)
        }
      } else if (attempt < maxRetries) {
        // For non-connection errors, wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  throw lastError
}

// Raw SQL queries to avoid prepared statements
export async function findUserByEmail(email: string) {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    return Array.isArray(result) ? result[0] : null
  })
}

export async function findUserById(id: string) {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `
    return Array.isArray(result) ? result[0] : null
  })
}

export async function countUsers() {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users WHERE role = 'SUPER_ADMIN'
    `
    return Array.isArray(result) ? Number(result[0]?.count) : 0
  })
}

export async function countMakanan() {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM makanan
    `
    return Array.isArray(result) ? Number(result[0]?.count) : 0
  })
}

export async function countJenisPaket() {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM jenis_paket
    `
    return Array.isArray(result) ? Number(result[0]?.count) : 0
  })
}

export async function findMakananById(id: number) {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT m.*, jp.nama_paket as "jenisPaketNama"
      FROM makanan m
      LEFT JOIN jenis_paket jp ON m.jenis_paket_id = jp.id
      WHERE m.id = ${id}
      LIMIT 1
    `
    if (Array.isArray(result) && result[0]) {
      const makanan = result[0] as any
      return {
        id: makanan.id,
        namaMakanan: makanan.nama_makanan,
        deskripsi: makanan.deskripsi,
        foto: makanan.foto,
        harga: makanan.harga,
        jenisPaketId: makanan.jenis_paket_id,
        createdAt: makanan.created_at,
        updatedAt: makanan.updated_at,
        jenisPaket: {
          id: makanan.jenis_paket_id,
          namaPaket: makanan.jenisPaketNama
        }
      }
    }
    return null
  })
}

export async function findMakananAll() {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT m.*, jp.nama_paket as "jenisPaketNama"
      FROM makanan m
      LEFT JOIN jenis_paket jp ON m.jenis_paket_id = jp.id
      ORDER BY m.created_at DESC
    `
    return (result as any[]).map(makanan => ({
      id: makanan.id,
      namaMakanan: makanan.nama_makanan,
      deskripsi: makanan.deskripsi,
      foto: makanan.foto,
      harga: makanan.harga,
      jenisPaketId: makanan.jenis_paket_id,
      createdAt: makanan.created_at,
      updatedAt: makanan.updated_at,
      jenisPaket: {
        id: makanan.jenis_paket_id,
        namaPaket: makanan.jenisPaketNama
      }
    }))
  })
}

export async function findJenisPaketAll() {
  return safeDbOperation(async () => {
    const result = await prisma.$queryRaw`
      SELECT * FROM jenis_paket ORDER BY created_at DESC
    `
    return (result as any[]).map(jenisPaket => ({
      id: jenisPaket.id,
      namaPaket: jenisPaket.nama_paket,
      createdAt: jenisPaket.created_at,
      updatedAt: jenisPaket.updated_at
    }))
  })
} 