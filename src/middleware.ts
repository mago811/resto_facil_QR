import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  if (isAdminRoute && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
})

export const config = { matcher: ['/admin/:path*'] }
