'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface JenisPaket {
  id: number
  namaPaket: string
}

interface PageProps {
  params: {
    id: string
  }
}

export default function EditJenisPaketPage({ params }: PageProps) {
  const [jenisPaket, setJenisPaket] = useState<JenisPaket | null>(null)
  const [namaPaket, setNamaPaket] = useState('')
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
          setNamaPaket(data.namaPaket)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!namaPaket) {
      setError('Nama paket harus diisi')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/jenis-paket/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namaPaket }),
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Jenis Paket</h1>
          <p className="text-gray-600">Ubah data jenis paket</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="namaPaket">Nama Paket</Label>
            <Input
              id="namaPaket"
              type="text"
              value={namaPaket}
              onChange={(e) => setNamaPaket(e.target.value)}
              placeholder="Masukkan nama paket"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Link href="/dashboard/jenis-paket" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Batal
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 