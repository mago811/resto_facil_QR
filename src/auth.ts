import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db, usuarios, restaurantes } from '@/shared/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const [user] = await db.select().from(usuarios).where(eq(usuarios.email, String(credentials.email)))
        if (!user) return null
        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash)
        if (!valid) return null
        const [restaurante] = await db
          .select({ id: restaurantes.id, slug: restaurantes.slug })
          .from(restaurantes)
          .where(eq(restaurantes.id, user.restauranteId))
        return {
          id: user.id,
          email: user.email,
          restauranteId: user.restauranteId,
          restauranteSlug: restaurante?.slug ?? '',
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { restauranteId: string; restauranteSlug: string }
        token.restauranteId = u.restauranteId
        token.restauranteSlug = u.restauranteSlug
      }
      return token
    },
    session({ session, token }) {
      session.user.restauranteId = token.restauranteId as string
      session.user.restauranteSlug = token.restauranteSlug as string
      return session
    },
  },
  pages: { signIn: '/login' },
})

declare module '@auth/core/types' {
  interface Session {
    user: {
      restauranteId: string
      restauranteSlug: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
