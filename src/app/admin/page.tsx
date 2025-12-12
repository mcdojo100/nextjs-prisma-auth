'use client'

import { useState } from 'react'
import { Box, Button, Stack, Typography, Alert } from '@mui/material'

export default function AdminPage() {
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function call(path: string) {
    setMsg(null)
    setErr(null)

    const res = await fetch(path, { method: 'POST' })
    const json = await res.json()

    if (!res.ok) {
      setErr(json?.error ?? 'Request failed')
      return
    }
    setMsg(json?.message ?? 'OK')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Admin
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {msg && <Alert severity="success">{msg}</Alert>}
        {err && <Alert severity="error">{err}</Alert>}

        <Button variant="contained" onClick={() => call('/api/admin/generate-demo-data')}>
          Generate Demo Data
        </Button>

        <Button variant="outlined" color="error" onClick={() => call('/api/admin/clear-demo-data')}>
          Clear Demo Data
        </Button>
      </Stack>
    </Box>
  )
}
