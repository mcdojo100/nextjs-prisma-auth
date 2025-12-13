// src/app/analysis/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

import IntensityOverTime from './IntensityOverTime'
import ImportanceOverTime from './ImportanceOverTime'
import EmotionFrequencyChart from './EmotionFrequencyChart'
import WeeklyReflectionCard from './WeeklyReflectionCard'
import SummaryCard from './SummaryCard'

type Range = '7' | '30' | 'month' | 'all'

type DailySummaryPoint = {
  date: string
  avgIntensity: number
  avgImportance: number
  count: number
}

type EmotionPoint = { emotion: string; count: number }

function trendLabel(sorted: DailySummaryPoint[]) {
  if (sorted.length < 2) return 'stayed fairly steady'
  const first = sorted[0]?.avgIntensity ?? 0
  const last = sorted[sorted.length - 1]?.avgIntensity ?? 0
  const diff = last - first
  if (diff > 0.5) return 'ramped up toward the end'
  if (diff < -0.5) return 'tapered toward the end'
  return 'stayed fairly steady'
}

export default function AnalysisPage() {
  const [range, setRange] = useState<Range>('7')
  const [avgIntensity, setAvgIntensity] = useState<number | null>(null)
  const [avgImportance, setAvgImportance] = useState<number | null>(null)
  const [mostCommonEmotion, setMostCommonEmotion] = useState<string | null>(null)
  const [volatility, setVolatility] = useState<number | null>(null)
  const [volatilityLabel, setVolatilityLabel] = useState<string | null>(null)

  const [summarySeries, setSummarySeries] = useState<DailySummaryPoint[]>([])
  const [emotionSeries, setEmotionSeries] = useState<EmotionPoint[]>([])

  useEffect(() => {
    let mounted = true

    async function loadStats() {
      try {
        const [summaryRes, emoRes] = await Promise.all([
          fetch(`/api/events/summary?range=${range}`),
          fetch(`/api/events/emotion-frequency?range=${range}`),
        ])

        if (!summaryRes.ok || !emoRes.ok) return

        const summary = (await summaryRes.json()) as DailySummaryPoint[]
        const emotions = (await emoRes.json()) as EmotionPoint[]

        if (!mounted) return

        setSummarySeries(Array.isArray(summary) ? summary : [])
        setEmotionSeries(Array.isArray(emotions) ? emotions : [])

        // Avg intensity / importance (weighted by count)
        const totalCount = (summary ?? []).reduce((s, p) => s + (p.count ?? 0), 0)
        if (totalCount > 0) {
          const weightedIntensity = (summary ?? []).reduce(
            (s, p) => s + (p.avgIntensity ?? 0) * (p.count ?? 0),
            0,
          )
          const weightedImportance = (summary ?? []).reduce(
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
        if ((summary ?? []).length > 0) {
          const vals = (summary ?? []).map((p) => p.avgIntensity ?? 0)

          function volatilityMAD(values: number[]) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length
            return values.reduce((sum, v) => sum + Math.abs(v - mean), 0) / values.length
          }

          const mad = volatilityMAD(vals)
          setVolatility(Number(mad.toFixed(2)))

          const label = mad < 1 ? 'low' : mad < 2 ? 'medium' : 'high'
          setVolatilityLabel(label)
        } else {
          setVolatility(null)
          setVolatilityLabel(null)
        }
      } catch {
        // ignore errors for stats
      }
    }

    loadStats()
    return () => {
      mounted = false
    }
  }, [range])

  // keep this if WeeklyReflectionCard needs it
  useMemo(() => {
    const sorted = [...summarySeries].sort((a, b) => (a.date < b.date ? -1 : 1))
    trendLabel(sorted)
    return null
  }, [summarySeries])

  return (
    <Box sx={{ mt: 2, px: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Typography variant="h4">Analysis</Typography>
      </Box>

      {/* Global time range selector */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="analysis-range-label">Time range</InputLabel>
          <Select
            labelId="analysis-range-label"
            value={range}
            label="Time range"
            onChange={(e) => setRange(e.target.value as Range)}
          >
            <MenuItem value={'7'}>7 days</MenuItem>
            <MenuItem value={'30'}>30 days</MenuItem>
            <MenuItem value={'month'}>This Month</MenuItem>
            <MenuItem value={'all'}>All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Weekly Reflection (shown only for 7 days) */}
      {range === '7' && (
        <WeeklyReflectionCard
          range={range}
          summarySeries={summarySeries}
          emotionSeries={emotionSeries}
          avgIntensity={avgIntensity}
          avgImportance={avgImportance}
          volatilityLabel={volatilityLabel}
        />
      )}

      {/* Summary card (title inside card) */}
      <SummaryCard
        avgIntensity={avgIntensity}
        avgImportance={avgImportance}
        mostCommonEmotion={mostCommonEmotion}
        volatilityLabel={volatilityLabel}
      />

      <IntensityOverTime range={range} />
      <ImportanceOverTime range={range} />
      <EmotionFrequencyChart range={range} />
    </Box>
  )
}
