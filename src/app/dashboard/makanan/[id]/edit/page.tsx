'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface JenisPaket {
  id: number
  namaPaket: string
}

interface Makanan {
  id: number
  namaMakanan: string
  deskripsi: string
  foto: string
  harga: number
  jenisPaketId: number
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

export default function EditMakananPage({ params }: PageProps) {
  const [makanan, setMakanan] = useState<Makanan | null>(null)
  const [namaMakanan, setNamaMakanan] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [foto, setFoto] = useState('')
  const [harga, setHarga] = useState('')
  const [jenisPaketId, setJenisPaketId] = useState('')
  const [jenisPaketList, setJenisPaketList] = useState<JenisPaket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch makanan data
        const makananResponse = await fetch(`/api/makanan/${params.id}`)
        if (makananResponse.ok) {
          const makananData = await makananResponse.json()
          setMakanan(makananData)
          setNamaMakanan(makananData.namaMakanan)
          setDeskripsi(makananData.deskripsi)
          setFoto(makananData.foto)
          setHarga(makananData.harga.toString())
          setJenisPaketId(makananData.jenisPaketId.toString())
        }

        // Fetch jenis paket list
        const jenisPaketResponse = await fetch('/api/jenis-paket')
        if (jenisPaketResponse.ok) {
          const jenisPaketData = await jenisPaketResponse.json()
          setJenisPaketList(jenisPaketData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Terjadi kesalahan saat memuat data')
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!namaMakanan || !deskripsi || !foto || !harga || !jenisPaketId) {
      setError('Semua field harus diisi')
      setLoading(false)
      return
    }

    const hargaNumber = parseInt(harga)
    if (isNaN(hargaNumber) || hargaNumber <= 0) {
      setError('Harga harus berupa angka positif')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/makanan/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaMakanan,
          deskripsi,
          foto,
          harga: hargaNumber,
          jenisPaketId: parseInt(jenisPaketId),
        }),
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

  if (!makanan) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Makanan</h1>
          <p className="text-gray-600">Ubah data makanan</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="namaMakanan">Nama Makanan</Label>
            <Input
              id="namaMakanan"
              type="text"
              value={namaMakanan}
              onChange={(e) => setNamaMakanan(e.target.value)}
              placeholder="Masukkan nama makanan"
              required
            />
          </div>

          <div>
            <Label htmlFor="jenisPaket">Jenis Paket</Label>
            <Select value={jenisPaketId} onValueChange={setJenisPaketId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis paket" />
              </SelectTrigger>
              <SelectContent>
                {jenisPaketList.map((paket) => (
                  <SelectItem key={paket.id} value={paket.id.toString()}>
                    {paket.namaPaket}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Masukkan deskripsi makanan"
              required
            />
          </div>

          <div>
            <Label htmlFor="foto">URL Foto</Label>
            <Input
              id="foto"
              type="url"
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              placeholder="Masukkan URL foto makanan"
              required
            />
            {foto && (
              <div className="mt-2">
                <img
                  src={foto}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-food.jpg'
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="harga">Harga (Rp)</Label>
            <Input
              id="harga"
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="Masukkan harga"
              min="0"
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
            <Link href={`/dashboard/makanan/${params.id}`} className="flex-1">
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