'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import { jenisPaketSchema, type JenisPaketFormData } from '@/lib/validations'

export default function TambahJenisPaketPage() {
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<JenisPaketFormData>({
    resolver: zodResolver(jenisPaketSchema),
  })

  const onSubmit = async (data: JenisPaketFormData) => {
    try {
      const response = await fetch('/api/jenis-paket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namaPaket: data.namaPaket }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Terjadi kesalahan')
      }

      router.push('/dashboard/makanan')
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Terjadi kesalahan' })
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard/makanan">
          <Button variant="outline" size="sm" className="bg-white border-blue-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Jenis Paket 📦</h1>
          <p className="text-gray-600">Buat jenis paket makanan baru</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Form Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-700">Form Jenis Paket</h2>
              <p className="text-blue-600">Lengkapi informasi jenis paket</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Package Name */}
            <div>
              <Label htmlFor="namaPaket" className="text-sm font-semibold text-gray-700 mb-3 block">
                Nama Paket *
              </Label>
              <Input
                id="namaPaket"
                type="text"
                {...register('namaPaket')}
                placeholder="Contoh: Paket Nasi, Paket Minuman, Paket Snack"
                className={`h-14 text-base ${errors.namaPaket ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
              />
              {errors.namaPaket && (
                <p className="text-red-500 text-sm mt-2">{errors.namaPaket.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Berikan nama yang jelas dan mudah dipahami untuk jenis paket ini
              </p>
            </div>

            {/* Examples Section */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-700 mb-3">Contoh Jenis Paket:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-gray-700">Paket Nasi</p>
                  <p className="text-xs text-gray-500">Nasi goreng, nasi putih, nasi kuning</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-gray-700">Paket Minuman</p>
                  <p className="text-xs text-gray-500">Es teh, es jeruk, kopi</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-gray-700">Paket Snack</p>
                  <p className="text-xs text-gray-500">Kentang goreng, keripik, kue</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-gray-700">Paket Utama</p>
                  <p className="text-xs text-gray-500">Makanan berat, lauk pauk</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                {errors.root.message}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Simpan Jenis Paket
                  </>
                )}
              </Button>
              <Link href="/dashboard/makanan" className="flex-1">
                <Button type="button" variant="outline" className="w-full h-12 text-base border-gray-300 text-gray-700 hover:bg-gray-50">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 