// src/app/analysis/WeeklyReflectionCard.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { Box, Button, Card, CardContent, Collapse, Divider, Stack, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

export type Range = '7' | '30' | 'month' | 'all'

export type DailySummaryPoint = {
  date: string
  avgIntensity: number
  avgImportance: number
  count: number
}

export type EmotionPoint = {
  emotion: string
  count: number
}

type Props = {
  range: Range
  summarySeries: DailySummaryPoint[]
  emotionSeries: EmotionPoint[]
  avgIntensity: number | null
  avgImportance: number | null
  volatilityLabel: string | null
}

function fmtRangeLabel(range: Range) {
  switch (range) {
    case '7':
      return 'Last 7 days'
    case '30':
      return 'Last 30 days'
    case 'month':
      return 'This month'
    case 'all':
      return 'All time'
    default:
      return ''
  }
}

function trendLabel(sorted: DailySummaryPoint[]) {
  if (sorted.length < 2) return 'stayed fairly steady'
  const first = sorted[0]?.avgIntensity ?? 0
  const last = sorted[sorted.length - 1]?.avgIntensity ?? 0
  const diff = last - first
  if (diff > 0.5) return 'ramped up toward the end'
  if (diff < -0.5) return 'tapered toward the end'
  return 'stayed fairly steady'
}

export default function WeeklyReflectionCard({
  range,
  summarySeries,
  emotionSeries,
  avgIntensity,
  volatilityLabel,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const weekly = useMemo(() => {
    const sorted = [...(summarySeries ?? [])].sort((a, b) => (a.date < b.date ? -1 : 1))
    const totalEvents = sorted.reduce((s, p) => s + (p.count ?? 0), 0)

    // Keep these for narrative only (don’t render as “stats”)
    const top2Emotions = (emotionSeries ?? []).slice(0, 2).map((e) => e.emotion)
    const trend = trendLabel(sorted)

    const intensityDescriptor =
      avgIntensity == null
        ? null
        : avgIntensity >= 7
          ? 'higher intensity'
          : avgIntensity >= 5
            ? 'moderate intensity'
            : 'lighter intensity'

    const volLabel = volatilityLabel ?? null

    const sentenceParts: string[] = []

    // Narrative summary (no raw numbers shown)
    if (intensityDescriptor && volLabel) {
      sentenceParts.push(
        `You logged a week of ${intensityDescriptor}, with ${volLabel} day-to-day swings.`,
      )
    } else if (intensityDescriptor) {
      sentenceParts.push(`You logged a week of ${intensityDescriptor}.`)
    } else if (volLabel) {
      sentenceParts.push(`Your week had ${volLabel} day-to-day swings.`)
    }

    sentenceParts.push(`Overall activity ${trend}.`)

    if (top2Emotions.length) {
      sentenceParts.push(`A couple emotions that showed up a lot: ${top2Emotions.join(' & ')}.`)
    }

    return {
      sorted,
      totalEvents,
      trend,
      conclusion: sentenceParts.join(' ').trim(),
    }
  }, [summarySeries, emotionSeries, avgIntensity, volatilityLabel])

  // Only show this card on the 7-day range
  if (range !== '7') return null

  const showWeekly = weekly.totalEvents >= 3

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Stack spacing={1.25} sx={{ pr: 6 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography fontWeight={800}>Weekly Reflection</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Last 7 days
            </Typography>
          </Stack>

          {/* Body text */}
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {weekly.conclusion}
          </Typography>

          {/* Collapsible content */}
          <Collapse in={!collapsed}>{/* ... */}</Collapse>
        </Stack>
      </CardContent>
    </Card>
  )
}
