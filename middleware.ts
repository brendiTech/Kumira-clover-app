import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  
  const path = request.nextUrl.pathname
  
  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/registro', '/auth/registro-exitoso', '/auth/error', '/api/kiosk']
  const isPublicPath = publicPaths.some(p => path.startsWith(p))
  
  // API routes for kiosk (public access for ordering)
  if (path.startsWith('/api/kiosk')) {
    return response
  }
  
  // If not logged in and trying to access protected route, redirect to login
  if (!user && !isPublicPath && !path.startsWith('/api')) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If logged in and trying to access auth pages, redirect to dashboard
  if (user && (path === '/auth/login' || path === '/auth/registro')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
