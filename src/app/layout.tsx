// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Next.js + Prisma + Auth",
  description: "Starter stack",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
