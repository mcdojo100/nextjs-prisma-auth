// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // If you add Google later:
    // GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in has `user`; persist DB id on the token
      if (user && (user as any).id) token.id = (user as any).id;
      // Fallback: re-use sub as id if needed
      if (!token.id && token.sub) token.id = token.sub;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
