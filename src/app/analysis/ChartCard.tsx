// src/app/analysis/ChartCard.tsx
'use client'

import React from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

type Props = {
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
  children: React.ReactNode
  sx?: any
}

export default function ChartCard({ title, subtitle, rightSlot, children, sx }: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'divider',
        overflow: 'hidden',
        ...sx,
        mb: 3,
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          {rightSlot ? <Box sx={{ flexShrink: 0 }}>{rightSlot}</Box> : null}
        </Stack>

        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  )
}
