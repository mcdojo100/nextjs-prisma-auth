// src/app/analysis/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material'
import IntensityOverTime from './IntensityOverTime'
import ImportanceOverTime from './ImportanceOverTime'
import EmotionFrequencyChart from './EmotionFrequencyChart'

export default function AnalysisPage() {
  const [range, setRange] = useState<'7' | '30' | 'month' | 'all'>('30')
  const [avgIntensity, setAvgIntensity] = useState<number | null>(null)
  const [avgImportance, setAvgImportance] = useState<number | null>(null)
  const [mostCommonEmotion, setMostCommonEmotion] = useState<string | null>(null)
  const [volatility, setVolatility] = useState<number | null>(null)
  const [volatilityLabel, setVolatilityLabel] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadStats() {
      try {
        const [summaryRes, emoRes] = await Promise.all([
          fetch(`/api/events/summary?range=${range}`),
          fetch(`/api/events/emotion-frequency?range=${range}`),
        ])

        if (!summaryRes.ok || !emoRes.ok) return

        const summary = (await summaryRes.json()) as Array<{
          date: string
          avgIntensity: number
          avgImportance: number
          count: number
        }>

        const emotions = (await emoRes.json()) as Array<{ emotion: string; count: number }>

        if (!mounted) return

        // Avg intensity / importance (weighted by count)
        const totalCount = summary.reduce((s, p) => s + (p.count ?? 0), 0)
        if (totalCount > 0) {
          const weightedIntensity = summary.reduce(
            (s, p) => s + (p.avgIntensity ?? 0) * (p.count ?? 0),
            0,
          )
          const weightedImportance = summary.reduce(
            (s, p) => s + (p.avgImportance ?? 0) * (p.count ?? 0),
            0,
          )
          setAvgIntensity(Number((weightedIntensity / totalCount).toFixed(2)))
          setAvgImportance(Number((weightedImportance / totalCount).toFixed(2)))
        } else {
          setAvgIntensity(null)
          setAvgImportance(null)
        }

        // Most common emotion
        if (Array.isArray(emotions) && emotions.length > 0) {
          setMostCommonEmotion(emotions[0].emotion)
        } else {
          setMostCommonEmotion(null)
        }

        // Volatility: mean absolute deviation (MAD) of daily avgIntensity
        if (summary.length > 0) {
          const vals = summary.map((p) => p.avgIntensity ?? 0)
          function volatilityMAD(values: number[]) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length
            return values.reduce((sum, v) => sum + Math.abs(v - mean), 0) / values.length
          }

          const mad = volatilityMAD(vals)
          setVolatility(Number(mad.toFixed(2)))

          // Map MAD to low/medium/high. Thresholds chosen for intensity scale (1-10).
          const label = mad < 1 ? 'low' : mad < 2 ? 'medium' : 'high'
          setVolatilityLabel(label)
        } else {
          setVolatility(null)
          setVolatilityLabel(null)
        }
      } catch (err) {
        // ignore errors for stats
      }
    }

    loadStats()

    return () => {
      mounted = false
    }
  }, [range])

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

      {/* Stats row */}
      <Box sx={{ mb: 3 }}>
        <Paper elevation={1} sx={{ p: 1, px: 2 }}>
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
              <Typography variant="h6">{volatilityLabel ?? '—'}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <IntensityOverTime range={range} />
      <ImportanceOverTime range={range} />
      <EmotionFrequencyChart range={range} />
    </Box>
  )
}
