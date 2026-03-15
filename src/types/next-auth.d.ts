import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'USER' | 'ADMIN'
  }
}

declare module 'next-auth' {
  interface Session {
    userId?: string
    role?: 'USER' | 'ADMIN'
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
