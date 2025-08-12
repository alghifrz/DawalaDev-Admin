'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Clock, UserCheck, Shield, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface PendingUser {
  id: string
  email: string
  name?: string
  authProvider: string
  createdAt: Date
}

interface ApprovedAdmin {
  id: string
  email: string
  name?: string
  role: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>('ADMIN')
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [approvedAdmins, setApprovedAdmins] = useState<ApprovedAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteAdmin, setDeleteAdmin] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        // Check user role
        const userResponse = await fetch('/api/auth/check-user-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })
        if (userResponse.ok) {
          const { role } = await userResponse.json()
          setUserRole(role)
          if (role !== 'SUPER_ADMIN') {
            router.push('/dashboard')
            return
          }
        }
        // Fetch pending users
        const pendingResponse = await fetch('/api/admin/pending-users')
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json()
          setPendingUsers(pendingData)
        }
        // Fetch approved admins
        const approvedResponse = await fetch('/api/admin/approved-admins')
        if (approvedResponse.ok) {
          const approvedData = await approvedResponse.json()
          setApprovedAdmins(approvedData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuthAndFetchData()
  }, [router])

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve')
    try {
      await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      window.location.reload()
    } catch (e) {
      alert('Gagal approve admin')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject')
    try {
      await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      window.location.reload()
    } catch (e) {
      alert('Gagal reject admin')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = (id: string, email: string) => {
    setDeleteAdmin({ id, email })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteAdmin) return

    setActionLoading(deleteAdmin.id + '-delete')
    try {
      await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteAdmin.id })
      })
      window.location.reload()
    } catch (e) {
      alert('Gagal hapus admin')
    } finally {
      setActionLoading(null)
      setShowDeleteModal(false)
      setDeleteAdmin(null)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Admin 👥</h1>
        <p className="text-gray-600">Kelola pendaftaran admin baru dan admin yang sudah disetujui.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Admins */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-orange-200 mb-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 bg-orange-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-orange-700">Menunggu Approval</span>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingUsers.length} pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Tanggal Daftar</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">Tidak ada admin yang menunggu approval.</td>
                    </tr>
                  ) : (
                    pendingUsers.map((user) => (
                      <tr key={user.id} className="border-t border-orange-100">
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-2 space-x-2">
                          <Button size="sm" onClick={() => handleApprove(user.id)} disabled={actionLoading === user.id + '-approve'}>
                            {actionLoading === user.id + '-approve' ? '...' : 'Approve'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)} disabled={actionLoading === user.id + '-reject'}>
                            {actionLoading === user.id + '-reject' ? '...' : 'Reject'}
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
        {/* Approved Admins */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 mb-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-100 bg-green-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">Admin Aktif</span>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {approvedAdmins.length} aktif
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Tanggal Daftar</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">Belum ada admin aktif.</td>
                    </tr>
                  ) : (
                    approvedAdmins.map((admin) => (
                      <tr key={admin.id} className="border-t border-green-100">
                        <td className="px-4 py-2">{admin.email}</td>
                        <td className="px-4 py-2">{new Date(admin.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-2">
                          <Button size="icon" onClick={() => handleDelete(admin.id, admin.email)} disabled={actionLoading === admin.id + '-delete'}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            title="Hapus"
                          >
                            {actionLoading === admin.id + '-delete' ? '...' : <Trash2 className="w-4 h-4 text-white" />}
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Konfirmasi Hapus Admin</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus admin <strong>{deleteAdmin.email}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={actionLoading === deleteAdmin.id + '-delete'}
                className="flex-1"
              >
                {actionLoading === deleteAdmin.id + '-delete' ? 'Menghapus...' : 'Hapus'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteAdmin(null)
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