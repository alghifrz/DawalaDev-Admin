'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Modal from '@/components/ui/modal'
import { Plus, Edit, Trash2, Languages } from 'lucide-react'
import { translateText } from '@/lib/translate'

interface JenisPaket {
  id: number
  namaPaket: string
  _count: {
    makanan: number
  }
  createdAt: Date
}

interface PageProps {
  jenisPaket: JenisPaket[]
}

export default function JenisPaketClient({ jenisPaket }: PageProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPaket, setEditingPaket] = useState<JenisPaket | null>(null)
  const [namaPaket, setNamaPaket] = useState('')
  const [namaPaketEn, setNamaPaketEn] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const router = useRouter()

  const handleAutoTranslate = async (text: string) => {
    if (!text.trim()) {
      setNamaPaketEn('')
      return
    }

    setIsTranslating(true)
    try {
      const translated = await translateText(text, 'en')
      setNamaPaketEn(translated)
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDelete = async (id: number, namaPaket: string, makananCount: number) => {
    if (makananCount > 0) {
      alert(`⚠️ Jenis paket "${namaPaket}" memiliki ${makananCount} makanan yang terkait. Anda tidak dapat menghapus jenis paket yang masih memiliki makanan.`)
      return
    }

    const confirmed = confirm(`Apakah Anda yakin ingin menghapus jenis paket "${namaPaket}"?`)
    if (!confirmed) return

    setLoading(id)
    
    try {
      const response = await fetch(`/api/jenis-paket/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus')
    } finally {
      setLoading(null)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ 
          namaPaket: namaPaket.trim(),
          namaPaketEn: namaPaketEn.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      setShowAddModal(false)
      setNamaPaket('')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menambah jenis paket')
    } finally {
      setModalLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ 
          namaPaket: namaPaket.trim(),
          namaPaketEn: namaPaketEn.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Terjadi kesalahan')
      }

      setShowEditModal(false)
      setEditingPaket(null)
      setNamaPaket('')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengubah jenis paket')
    } finally {
      setModalLoading(false)
    }
  }

  const openEditModal = (paket: JenisPaket) => {
    setEditingPaket(paket)
    setNamaPaket(paket.namaPaket)
    setNamaPaketEn('') // Reset English translation
    setShowEditModal(true)
  }

  const openAddModal = () => {
    setNamaPaket('')
    setNamaPaketEn('')
    setShowAddModal(true)
  }

  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setEditingPaket(null)
    setNamaPaket('')
    setNamaPaketEn('')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jenis Paket</h1>
          <p className="text-gray-600">Kelola jenis paket makanan</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jenis Paket
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Daftar Jenis Paket</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Makanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jenisPaket.map((paket) => (
                <tr key={paket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {paket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paket.namaPaket}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paket._count.makanan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(paket.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditModal(paket)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(paket.id, paket.namaPaket, paket._count.makanan)}
                      disabled={loading === paket.id}
                    >
                      {loading === paket.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModals}
        title="Tambah Jenis Paket"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="namaPaket">Nama Paket (Indonesia)</Label>
            <Input
              id="namaPaket"
              type="text"
              value={namaPaket}
              onChange={(e) => {
                setNamaPaket(e.target.value)
                // Auto-translate after user stops typing (debounced)
                clearTimeout((window as any).translateTimeout)
                ;(window as any).translateTimeout = setTimeout(() => {
                  handleAutoTranslate(e.target.value)
                }, 2000) // Wait 2 seconds after user stops typing
              }}
              placeholder="Masukkan nama paket"
              required
            />
          </div>

          <div>
            <Label htmlFor="namaPaketEn" className="flex items-center gap-2">
              Nama Paket (English)
              {isTranslating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              <Languages className="h-4 w-4 text-blue-600" />
            </Label>
            <Input
              id="namaPaketEn"
              type="text"
              value={namaPaketEn}
              onChange={(e) => setNamaPaketEn(e.target.value)}
              placeholder="English translation will appear here..."
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Terjemahan otomatis dari bahasa Indonesia ke English
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={modalLoading}
              className="flex-1"
            >
              {modalLoading ? 'Menambahkan...' : 'Tambah Jenis Paket'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModals}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeModals}
        title="Edit Jenis Paket"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <Label htmlFor="editNamaPaket">Nama Paket (Indonesia)</Label>
            <Input
              id="editNamaPaket"
              type="text"
              value={namaPaket}
              onChange={(e) => {
                setNamaPaket(e.target.value)
                // Auto-translate after user stops typing (debounced)
                clearTimeout((window as any).translateTimeout)
                ;(window as any).translateTimeout = setTimeout(() => {
                  handleAutoTranslate(e.target.value)
                }, 2000) // Wait 2 seconds after user stops typing
              }}
              placeholder="Masukkan nama paket"
              required
            />
          </div>

          <div>
            <Label htmlFor="editNamaPaketEn" className="flex items-center gap-2">
              Nama Paket (English)
              {isTranslating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              <Languages className="h-4 w-4 text-blue-600" />
            </Label>
            <Input
              id="editNamaPaketEn"
              type="text"
              value={namaPaketEn}
              onChange={(e) => setNamaPaketEn(e.target.value)}
              placeholder="English translation will appear here..."
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Terjemahan otomatis dari bahasa Indonesia ke English
            </p>
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
              onClick={closeModals}
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
