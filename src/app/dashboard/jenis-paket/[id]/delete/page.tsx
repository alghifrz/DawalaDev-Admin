'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface JenisPaket {
  id: number
  namaPaket: string
  _count: {
    makanan: number
  }
}

interface PageProps {
  params: {
    id: string
  }
}

export default function DeleteJenisPaketPage({ params }: PageProps) {
  const [jenisPaket, setJenisPaket] = useState<JenisPaket | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchJenisPaket = async () => {
      try {
        const response = await fetch(`/api/jenis-paket/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setJenisPaket(data)
        } else {
          setError('Jenis paket tidak ditemukan')
        }
      } catch (error) {
        console.error('Error fetching jenis paket:', error)
        setError('Terjadi kesalahan saat memuat data')
      }
    }

    fetchJenisPaket()
  }, [params.id])

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/jenis-paket/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Terjadi kesalahan')
      }

      router.push('/dashboard/jenis-paket')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!jenisPaket && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error && !jenisPaket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/jenis-paket">
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
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/jenis-paket">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hapus Jenis Paket</h1>
          <p className="text-gray-600">Konfirmasi penghapusan jenis paket</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Peringatan</h3>
            <p className="text-red-700 mt-1">
              Anda akan menghapus jenis paket ini secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Detail Jenis Paket yang Akan Dihapus</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">ID Jenis Paket</label>
            <p className="text-lg font-semibold text-gray-900">{jenisPaket?.id}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Nama Paket</label>
            <p className="text-lg font-semibold text-gray-900">{jenisPaket?.namaPaket}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Jumlah Makanan Terkait</label>
            <p className="text-lg text-gray-900">{jenisPaket?._count.makanan || 0} makanan</p>
          </div>
        </div>

        {jenisPaket?._count.makanan && jenisPaket._count.makanan > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Perhatian</h3>
                <p className="text-yellow-700 mt-1 text-sm">
                  Jenis paket ini memiliki {jenisPaket._count.makanan} makanan terkait. 
                  Menghapus jenis paket ini akan menghapus semua makanan yang terkait.
                </p>
              </div>
            </div>
          </div>
        )}
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
          {loading ? 'Menghapus...' : 'Hapus Jenis Paket'}
        </Button>
        <Link href="/dashboard/jenis-paket" className="flex-1">
          <Button variant="outline" className="w-full">
            Batal
          </Button>
        </Link>
      </div>
    </div>
  )
} 