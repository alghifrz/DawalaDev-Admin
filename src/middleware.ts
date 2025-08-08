import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to auth pages and API routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow access to static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Check authentication for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // User not authenticated, redirect to login
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      // User is authenticated, let the dashboard layout handle approval checks
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      // If there's an error, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // For all other routes, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 