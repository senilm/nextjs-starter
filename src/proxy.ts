/**
 * @file middleware.ts
 * @module middleware
 * Route protection — cookie-based optimistic auth check.
 */

import { getSessionCookie } from 'better-auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

const AUTH_PAGES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email']

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  /* Redirect authenticated users away from auth pages */
  if (AUTH_PAGES.some((page) => pathname.startsWith(page)) && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  /* Protect dashboard and admin routes */
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ],
}
