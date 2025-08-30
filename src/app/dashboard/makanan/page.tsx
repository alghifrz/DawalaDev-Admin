'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Modal from '@/components/ui/modal'
import { Plus, Edit, Trash2, Utensils, Package, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { MultiLangText } from '@/components/MultiLangText'

interface Makanan {
  id: number
  namaMakanan: string
  deskripsi: string
  deskripsiEn?: string
  foto: string | string[]
  harga: number
  jenisPaketId: number
  jenisPaket: {
    id: number
    namaPaket: string
    namaPaketEn?: string
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
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPaket, setEditingPaket] = useState<JenisPaket | null>(null)
  const [namaPaket, setNamaPaket] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [searchJenisPaket, setSearchJenisPaket] = useState('')
  const [searchMakanan, setSearchMakanan] = useState('')
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

  const handleDeleteMakanan = async (id: number, name: string) => {
    const confirmed = confirm(`Apakah Anda yakin ingin menghapus menu "${name}"?`)
    if (!confirmed) return

    setDeleteLoading(id)
    
    try {
      const response = await fetch(`/api/makanan/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      // Refresh data
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDeleteJenisPaket = async (id: number, name: string) => {
    // Check if jenis paket has associated makanan
    const menuCount = makanan.filter(m => m.jenisPaketId === id).length
    
    if (menuCount > 0) {
      alert(`⚠️ Jenis paket "${name}" memiliki ${menuCount} menu yang terkait. Anda tidak dapat menghapus jenis paket yang masih memiliki menu.`)
      return
    }

    const confirmed = confirm(`Apakah Anda yakin ingin menghapus jenis paket "${name}"?`)
    if (!confirmed) return

    setDeleteLoading(id)
    
    try {
      const response = await fetch(`/api/jenis-paket/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      // Refresh data
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleAddJenisPaket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!namaPaket.trim()) {
      alert('Nama paket harus diisi')
      return
    }

    setModalLoading(true)
    
    try {
      const response = await fetch('/api/jenis-paket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namaPaket: namaPaket.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      setShowAddModal(false)
      setNamaPaket('')
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menambah jenis paket')
    } finally {
      setModalLoading(false)
    }
  }

  const handleEditJenisPaket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPaket || !namaPaket.trim()) {
      alert('Nama paket harus diisi')
      return
    }

    setModalLoading(true)
    
    try {
      const response = await fetch(`/api/jenis-paket/${editingPaket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namaPaket: namaPaket.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      setShowEditModal(false)
      setEditingPaket(null)
      setNamaPaket('')
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengubah jenis paket')
    } finally {
      setModalLoading(false)
    }
  }

  const openEditModal = (paket: JenisPaket) => {
    setEditingPaket(paket)
    setNamaPaket(paket.namaPaket)
    setShowEditModal(true)
  }

  const closeModal = () => {
    setShowEditModal(false)
    setShowAddModal(false)
    setEditingPaket(null)
    setNamaPaket('')
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

  // Filter data berdasarkan pencarian
  const filteredJenisPaket = jenisPaket.filter(paket =>
    paket.namaPaket.toLowerCase().includes(searchJenisPaket.toLowerCase())
  )

  const filteredMakanan = makananWithImages.filter(item =>
    item.namaMakanan.toLowerCase().includes(searchMakanan.toLowerCase()) ||
    item.deskripsi.toLowerCase().includes(searchMakanan.toLowerCase()) ||
    item.jenisPaket.namaPaket.toLowerCase().includes(searchMakanan.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Gastronomi</h1>
        <p className="text-gray-600">Kelola menu makanan dan jenis paket gastronomi.</p>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Jenis Paket - Kiri */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 mb-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Jenis Paket</h3>
                  <p className="text-sm text-blue-600">Kategori menu</p>
                </div>
              </div>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                {jenisPaket.length} jenis
              </span>
            </div>
            <div className="px-6 py-4 border-b border-blue-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari jenis paket..."
                  value={searchJenisPaket}
                  onChange={(e) => setSearchJenisPaket(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Paket
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-blue-700">Nama Paket</th>
                    <th className="px-4 py-3 text-left font-medium text-blue-700">Menu</th>
                    <th className="px-4 py-3 text-left font-medium text-blue-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJenisPaket.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>{searchJenisPaket ? 'Tidak ada jenis paket yang cocok' : 'Belum ada jenis paket'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredJenisPaket.map((paket) => {
                      const menuCount = makananWithImages.filter(m => m.jenisPaketId === paket.id).length
                      return (
                        <tr key={paket.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{paket.namaPaket}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              {menuCount} menu
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                onClick={() => openEditModal(paket)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteJenisPaket(paket.id, paket.namaPaket)}
                                disabled={deleteLoading === paket.id}
                              >
                                {deleteLoading === paket.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
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

        {/* Menu Makanan - Kanan */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 mb-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-100 bg-green-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Utensils className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Menu Makanan</h3>
                  <p className="text-sm text-green-600">Daftar menu gastronomi</p>
                </div>
              </div>
              <span className="bg-green-200 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                {makananWithImages.length} menu
              </span>
            </div>
            <div className="px-6 py-4 border-b border-green-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari menu makanan..."
                  value={searchMakanan}
                  onChange={(e) => setSearchMakanan(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <Link href="/dashboard/makanan/tambah">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Menu
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-green-700 w-16">Foto</th>
                    <th className="px-4 py-3 text-left font-medium text-green-700">Nama Menu</th>
                    <th className="px-4 py-3 text-left font-medium text-green-700 w-40">Jenis</th>
                    <th className="px-4 py-3 text-left font-medium text-green-700 w-28">Harga</th>
                    <th className="px-4 py-3 text-left font-medium text-green-700 w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMakanan.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        <Utensils className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>{searchMakanan ? 'Tidak ada menu yang cocok' : 'Belum ada menu makanan'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMakanan.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-12 w-12 relative rounded-lg overflow-hidden bg-gray-100">
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
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900 mb-1">{item.namaMakanan}</div>
                            <div 
                              className="text-xs text-gray-500 cursor-help" 
                              title={item.deskripsi}
                            >
                              {item.deskripsi.length > 80 
                                ? `${item.deskripsi.substring(0, 80)}...` 
                                : item.deskripsi
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <MultiLangText
                            textEn={item.jenisPaket.namaPaketEn}
                            defaultText={item.jenisPaket.namaPaket}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            showLanguageToggle={false}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-green-600">
                            Rp {item.harga.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            <Link href={`/dashboard/makanan/${item.id}/edit`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-green-50">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteMakanan(item.id, item.namaMakanan)}
                              disabled={deleteLoading === item.id}
                            >
                              {deleteLoading === item.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Jenis Paket Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title="Tambah Jenis Paket"
      >
        <form onSubmit={handleAddJenisPaket} className="space-y-4">
          <div>
            <Label htmlFor="addNamaPaket">Nama Paket</Label>
            <Input
              id="addNamaPaket"
              type="text"
              value={namaPaket}
              onChange={(e) => setNamaPaket(e.target.value)}
              placeholder="Masukkan nama paket"
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={modalLoading}
              className="flex-1"
            >
              {modalLoading ? 'Menambah...' : 'Tambah Paket'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModal}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Jenis Paket Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeModal}
        title="Edit Jenis Paket"
      >
        <form onSubmit={handleEditJenisPaket} className="space-y-4">
          <div>
            <Label htmlFor="editNamaPaket">Nama Paket</Label>
            <Input
              id="editNamaPaket"
              type="text"
              value={namaPaket}
              onChange={(e) => setNamaPaket(e.target.value)}
              placeholder="Masukkan nama paket"
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={modalLoading}
              className="flex-1"
            >
              {modalLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModal}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 