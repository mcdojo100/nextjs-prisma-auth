'use client'

import React from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

type Props = {
  avgIntensity: number | null
  avgImportance: number | null
  mostCommonEmotion: string | null
  volatilityLabel: string | null
}

export default function SummaryCard({
  avgIntensity,
  avgImportance,
  mostCommonEmotion,
  volatilityLabel,
}: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        overflow: 'hidden',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Stack spacing={1.5}>
          <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
            Summary
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Avg intensity
              </Typography>
              <Typography variant="h6">{avgIntensity ?? '—'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Avg importance
              </Typography>
              <Typography variant="h6">{avgImportance ?? '—'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Most common emotion
              </Typography>
              <Typography variant="h6">{mostCommonEmotion ?? '—'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Volatility
              </Typography>
              <Typography variant="h6" sx={{ textTransform: 'lowercase' }}>
                {volatilityLabel ?? '—'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
