import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Terjadi kesalahan saat proses autentikasi. Silakan coba lagi.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/auth/login">
            <Button className="w-full">
              Kembali ke Login
            </Button>
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Jika masalah berlanjut, silakan hubungi administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 