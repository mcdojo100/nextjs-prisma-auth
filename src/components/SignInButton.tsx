'use client'

import { Button } from '@mui/material'
import { signIn } from 'next-auth/react'
import type { ReactNode } from 'react'

export function SignInButton({
  provider,
  children = 'Sign In',
}: {
  provider?: string
  children?: ReactNode
}) {
  return (
    <Button
      variant="text"
      onClick={() => {
        // If a provider is supplied, sign in with that provider.
        // Otherwise open the NextAuth sign-in page where the user can pick.
        if (provider) signIn(provider)
        else signIn()
      }}
    >
      {children}
    </Button>
  )
}
