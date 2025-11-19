// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Box } from "@mui/material";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Header from "@/components/header/Header";

export const metadata: Metadata = {
  title: "Next.js + Prisma + Auth",
  description: "Starter stack",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          <Box
            sx={{
              height: "100vh",
              width: "100vw",
              bgcolor: "background.default",
              color: "text.primary",
            }}
          >
            <Header session={session} />
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  );
}
