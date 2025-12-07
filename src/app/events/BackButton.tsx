'use client'

import React from 'react'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="text"
      size="small"
      startIcon={<span style={{ fontSize: '1.2rem' }}>←</span>}
      sx={{ textTransform: 'none', px: 1, height: '30.75px' }}
      onClick={() => router.push('/events')}
    >
      Back to Events
    </Button>
  )
}
