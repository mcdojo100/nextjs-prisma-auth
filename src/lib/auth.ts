// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

const isDev = process.env.NODE_ENV === 'development'

const providers: any[] = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    ...providers,
    ...(isDev
      ? [
          CredentialsProvider({
            name: 'Dev Login',
            credentials: {
              email: { label: 'Email', type: 'text' },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null

              // Look up the user by email in the seeded DB
              const user = await db.user.findUnique({
                where: { email: credentials.email },
              })

              // If the user exists (e.g., john@example.com), log them in
              return user ?? null
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in has `user`; persist DB id on the token
      if (user && (user as any).id) token.id = (user as any).id
      // Fallback: re-use sub as id if needed
      if (!token.id && token.sub) token.id = token.sub
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string)
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
