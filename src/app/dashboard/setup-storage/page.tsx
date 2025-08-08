'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SetupStoragePage() {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupStorage = async () => {
    setIsSettingUp(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/setup-storage', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error })
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to setup storage' })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard/makanan">
          <Button variant="outline" size="sm" className="bg-white border-blue-200 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setup Storage 🗄️</h1>
          <p className="text-gray-600">Konfigurasi storage untuk upload foto</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Storage Bucket</h2>
              <p className="text-gray-600">
                Buat bucket storage untuk menyimpan foto menu makanan
              </p>
            </div>

            {result && (
              <div className={`p-4 rounded-xl border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={setupStorage}
                disabled={isSettingUp}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                {isSettingUp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Setup Storage
                  </>
                )}
              </Button>

              {result?.success && (
                <Link href="/dashboard/makanan/tambah">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                    Lanjut ke Tambah Menu
                  </Button>
                </Link>
              )}
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <p>• Bucket akan dibuat dengan nama "makanan-images"</p>
              <p>• Bucket akan dikonfigurasi sebagai public</p>
              <p>• Hanya file gambar yang diizinkan (JPG, PNG, GIF, WebP)</p>
              <p>• Maksimal ukuran file 5MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
