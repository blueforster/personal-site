import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function middleware(req: NextRequest) {
  return NextResponse.next()
}

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === 'ADMIN',
  },
})

export default process.env.NODE_ENV === 'development'
  ? middleware
  : authMiddleware

export const config = {
  // Protect the CMS UI and custom admin page.
  // /api/keystatic is intentionally excluded — Keystatic needs those routes
  // for its own GitHub OAuth callback flow.
  matcher: ['/keystatic/:path*', '/admin/:path*'],
}
