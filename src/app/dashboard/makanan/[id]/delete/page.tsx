'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Makanan {
  id: number
  namaMakanan: string
  deskripsi: string
  foto: string
  harga: number
  jenisPaket: {
    id: number
    namaPaket: string
  }
}

interface PageProps {
  params: {
    id: string
  }
}

export default function DeleteMakananPage({ params }: PageProps) {
  const [makanan, setMakanan] = useState<Makanan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchMakanan = async () => {
      try {
        const response = await fetch(`/api/makanan/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setMakanan(data)
        } else {
          setError('Makanan tidak ditemukan')
        }
      } catch (error) {
        console.error('Error fetching makanan:', error)
        setError('Terjadi kesalahan saat memuat data')
      }
    }

    fetchMakanan()
  }, [params.id])

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/makanan/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Terjadi kesalahan')
      }

      router.push('/dashboard/makanan')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!makanan && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error && !makanan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/makanan">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <p className="text-gray-600">Terjadi kesalahan</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/makanan/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hapus Makanan</h1>
          <p className="text-gray-600">Konfirmasi penghapusan makanan</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Peringatan</h3>
            <p className="text-red-700 mt-1">
              Anda akan menghapus makanan ini secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Detail Makanan yang Akan Dihapus</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nama Makanan</label>
            <p className="text-lg font-semibold text-gray-900">{makanan?.namaMakanan}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Jenis Paket</label>
            <p className="text-gray-900">{makanan?.jenisPaket.namaPaket}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Harga</label>
            <p className="text-gray-900">Rp {makanan?.harga.toLocaleString()}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Deskripsi</label>
            <p className="text-gray-900">{makanan?.deskripsi}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          onClick={handleDelete}
          disabled={loading}
          variant="destructive"
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {loading ? 'Menghapus...' : 'Hapus Makanan'}
        </Button>
        <Link href={`/dashboard/makanan/${params.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            Batal
          </Button>
        </Link>
      </div>
    </div>
  )
} 