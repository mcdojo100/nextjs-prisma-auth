// app/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Box, Button, Typography } from '@mui/material'
import Link from 'next/link'
import { SignInButton } from '../components/SignInButton'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <Box
      sx={{
        py: 8,
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" sx={{ mb: 2 }}>
        SPIRAL SLAYER
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        Track events. Understand your mind. Break the spiral.
      </Typography>

      {session?.user ? (
        <Link href="/events">
          <Button variant="contained" sx={{ textTransform: 'none', mt: 1 }}>
            Go to My Events
          </Button>
        </Link>
      ) : (
        <SignInButton />
      )}
    </Box>
  )
}
