'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, AlertTriangle, User, Mail, Shield } from 'lucide-react'
import Link from 'next/link'

interface Admin {
  id: string
  email: string
  role: string
  createdAt: string
}

interface PageProps {
  params: {
    id: string
  }
}

export default function DeleteAdminPage({ params }: PageProps) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch(`/api/admin/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setAdmin(data)
        } else {
          setError('Admin tidak ditemukan')
        }
      } catch (error) {
        console.error('Error fetching admin:', error)
        setError('Terjadi kesalahan saat memuat data')
      }
    }

    fetchAdmin()
  }, [params.id])

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Terjadi kesalahan')
      }

      router.push('/dashboard/admin')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!admin && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error && !admin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/admin">
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
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hapus Admin</h1>
          <p className="text-gray-600">Konfirmasi penghapusan admin</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Peringatan</h3>
            <p className="text-red-700 mt-1">
              Anda akan menghapus admin ini secara permanen. Admin tidak akan dapat mengakses sistem lagi.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Detail Admin yang Akan Dihapus</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="flex items-center mt-1">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-lg font-semibold text-gray-900">{admin?.email}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Role</label>
            <div className="flex items-center mt-1">
              <Shield className="h-4 w-4 text-gray-400 mr-2" />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {admin?.role}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Tanggal Dibuat</label>
            <div className="flex items-center mt-1">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">
                {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </span>
            </div>
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
          {loading ? 'Menghapus...' : 'Hapus Admin'}
        </Button>
        <Link href="/dashboard/admin" className="flex-1">
          <Button variant="outline" className="w-full">
            Batal
          </Button>
        </Link>
      </div>
    </div>
  )
} 