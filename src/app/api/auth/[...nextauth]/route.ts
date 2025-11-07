// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // good default; you can switch to database if preferred
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub; // expose user id to client
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
