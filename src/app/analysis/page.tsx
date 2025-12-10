// src/app/analysis/page.tsx
'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import IntensityOverTime from './IntensityOverTime'
import ImportanceOverTime from './ImportanceOverTime'

export default function AnalysisPage() {
  return (
    <Box sx={{ mt: 2, px: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h4">Analysis</Typography>
      </Box>

      <IntensityOverTime />
      <ImportanceOverTime />
    </Box>
  )
}
