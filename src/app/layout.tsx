// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { Box, Container } from '@mui/material'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Header from '@/components/header/Header'

export const metadata: Metadata = {
  title: {
    default: 'Spiral Slayer',
    template: '%s | Spiral Slayer',
  },
  description: 'Track events. Break spirals. Find clarity.',
  icons: {
    icon: '/spiral-slayer-icon.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <Providers>
          <Box
            sx={{
              minHeight: '100vh',
              bgcolor: 'background.default',
              color: 'text.primary',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Header session={session} />
            <Container
              maxWidth="md"
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 3,
                my: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              {children}
            </Container>
          </Box>
        </Providers>
      </body>
    </html>
  )
}
