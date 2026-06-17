import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isPublicPath =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/api/auth')

  if (!req.auth && !isPublicPath) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    const safeRedirect = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/dashboard'
    url.searchParams.set('redirigir', safeRedirect)
    return NextResponse.redirect(url)
  }

  if (req.auth && (pathname === '/login' || pathname === '/register')) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
