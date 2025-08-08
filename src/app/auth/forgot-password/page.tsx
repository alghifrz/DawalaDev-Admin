'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'
import AuthLayout from '@/components/auth-layout'

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState('')
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError('root', { message: error.message })
        return
      }

      setSuccess('Link reset password telah dikirim ke email Anda. Silakan cek inbox atau spam folder.')
    } catch (error) {
      setError('root', { message: 'Terjadi kesalahan saat mengirim reset password' })
    }
  }

  return (
    <AuthLayout 
      title="Lupa Password"
      subtitle="Masukkan email Anda untuk reset password"
    >
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Masukkan email Anda"
                className={`pl-10 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white/50 backdrop-blur-sm ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="text-red-600 text-sm text-center">{errors.root.message}</div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Reset Password'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Kembali ke Login
          </Link>
        </div>
    </AuthLayout>
  )
} 