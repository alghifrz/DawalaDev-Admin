'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Utensils, Package, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Makanan {
  id: number
  namaMakanan: string
  deskripsi: string
  foto: string | string[]
  harga: number
  jenisPaketId: number
  jenisPaket: {
    id: number
    namaPaket: string
  }
}

interface JenisPaket {
  id: number
  namaPaket: string
}

export default function MakananPage() {
  const [makanan, setMakanan] = useState<Makanan[]>([])
  const [jenisPaket, setJenisPaket] = useState<JenisPaket[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ id: number; name: string; type: 'makanan' | 'jenisPaket' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [makananRes, jenisPaketRes] = await Promise.all([
        fetch('/api/makanan'),
        fetch('/api/jenis-paket')
      ])
      
      if (makananRes.ok) {
        const makananData = await makananRes.json()
        setMakanan(makananData)
      }
      
      if (jenisPaketRes.ok) {
        const jenisPaketData = await jenisPaketRes.json()
        setJenisPaket(jenisPaketData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number, name: string, type: 'makanan' | 'jenisPaket') => {
    setDeleteItem({ id, name, type })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteItem) return

    try {
      const endpoint = deleteItem.type === 'makanan' ? `/api/makanan/${deleteItem.id}` : `/api/jenis-paket/${deleteItem.id}`
      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh data
        fetchData()
        setShowDeleteModal(false)
        setDeleteItem(null)
      } else {
        console.error('Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  // Parse foto JSON for each makanan
  const makananWithImages = makanan.map((item: Makanan) => {
    let images: string[] = []
    
    if (item.foto) {
      if (Array.isArray(item.foto)) {
        // If foto is already an array, filter out empty strings
        images = item.foto.filter(img => img && typeof img === 'string' && img.trim() !== '')
      } else if (typeof item.foto === 'string') {
        // If foto is a string, try to parse it as JSON
        try {
          if (item.foto.trim() !== '') {
            const parsed = JSON.parse(item.foto)
            images = Array.isArray(parsed) ? parsed.filter(img => img && typeof img === 'string' && img.trim() !== '') : []
          }
        } catch {
          // Fallback for old format - treat as single image URL
          if (item.foto.trim() !== '') {
            images = [item.foto]
          }
        }
      }
    }
    
    return { ...item, images }
  })

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
                  </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus <strong>{deleteItem.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
              >
                Hapus
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteItem(null)
                }}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Menu Makanan */}
        <div className="lg:col-span-7">
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
                          <Link href={`/dashboard/makanan/${item.id}/edit`}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(item.id, item.namaMakanan, 'makanan')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
        <div className="lg:col-span-3">
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
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(paket.id, paket.namaPaket, 'jenisPaket')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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