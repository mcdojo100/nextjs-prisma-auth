// src/app/analysis/page.tsx
'use client'

import React, { useState } from 'react'
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import IntensityOverTime from './IntensityOverTime'
import ImportanceOverTime from './ImportanceOverTime'
import EmotionFrequencyChart from './EmotionFrequencyChart'

export default function AnalysisPage() {
  const [range, setRange] = useState<'7' | '30' | 'month' | 'all'>('30')

  return (
    <Box sx={{ mt: 2, px: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Typography variant="h4">Analysis</Typography>
      </Box>

      {/* Global time range selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="analysis-range-label">Time range</InputLabel>
          <Select
            labelId="analysis-range-label"
            value={range}
            label="Time range"
            onChange={(e) => setRange(e.target.value as any)}
          >
            <MenuItem value={'7'}>7 days</MenuItem>
            <MenuItem value={'30'}>30 days</MenuItem>
            <MenuItem value={'month'}>This Month</MenuItem>
            <MenuItem value={'all'}>All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <IntensityOverTime range={range} />
      <ImportanceOverTime range={range} />
      <EmotionFrequencyChart range={range} />
    </Box>
  )
}
