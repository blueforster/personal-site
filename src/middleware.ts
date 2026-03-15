import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === 'ADMIN',
  },
})

export const config = {
  // Protect the CMS UI and custom admin page.
  // /api/keystatic is intentionally excluded — Keystatic needs those routes
  // for its own GitHub OAuth callback flow.
  matcher: ['/keystatic/:path*', '/admin/:path*'],
}
