import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Eye, Utensils, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function MakananPage() {
  const makanan = await prisma.makanan.findMany({
    include: {
      jenisPaket: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const jenisPaket = await prisma.jenisPaket.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Parse foto JSON for each makanan
  const makananWithImages = makanan.map(item => {
    let images: string[] = []
    try {
      images = JSON.parse(item.foto)
    } catch {
      // Fallback for old format
      images = [item.foto]
    }
    return { ...item, images }
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Gastronomi 🍽️</h1>
        <p className="text-gray-600">Kelola menu makanan dan jenis paket gastronomi.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href="/dashboard/makanan/tambah">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Menu
          </Button>
        </Link>
        <Link href="/dashboard/jenis-paket/tambah">
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Package className="h-4 w-4 mr-2" />
            Tambah Jenis Paket
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Menu Makanan */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 mb-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-100 bg-green-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">Menu Makanan</span>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {makananWithImages.length} menu
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Foto</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Nama Menu</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Jenis</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Harga</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {makananWithImages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">Belum ada menu makanan.</td>
                    </tr>
                  ) : (
                    makananWithImages.map((item) => (
                      <tr key={item.id} className="border-t border-green-100 hover:bg-green-50">
                        <td className="px-4 py-2">
                          <div className="h-12 w-12 relative rounded-lg overflow-hidden">
                            <Image
                              src={item.images[0] || '/placeholder-food.jpg'}
                              alt={item.namaMakanan}
                              fill
                              className="object-cover"
                            />
                            {item.images.length > 1 && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
                                +{item.images.length - 1}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium text-gray-900">{item.namaMakanan}</div>
                            <div className="text-xs text-gray-500 truncate max-w-32">{item.deskripsi}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {item.jenisPaket.namaPaket}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium text-green-600">
                          Rp {item.harga.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 space-x-1">
                          <Link href={`/dashboard/makanan/${item.id}`}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/makanan/${item.id}/edit`}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/makanan/${item.id}/delete`}>
                            <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Jenis Paket */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-blue-200 mb-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-700">Jenis Paket</span>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {jenisPaket.length} jenis
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Nama Paket</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Menu Count</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jenisPaket.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-500">Belum ada jenis paket.</td>
                    </tr>
                  ) : (
                    jenisPaket.map((paket) => {
                      const menuCount = makananWithImages.filter(m => m.jenisPaketId === paket.id).length
                      return (
                        <tr key={paket.id} className="border-t border-blue-100 hover:bg-blue-50">
                          <td className="px-4 py-2 font-medium text-gray-900">{paket.namaPaket}</td>
                          <td className="px-4 py-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {menuCount} menu
                            </span>
                          </td>
                          <td className="px-4 py-2 space-x-1">
                            <Link href={`/dashboard/jenis-paket/${paket.id}/edit`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/jenis-paket/${paket.id}/delete`}>
                              <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 