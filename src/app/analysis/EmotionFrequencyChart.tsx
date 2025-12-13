'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from 'recharts'
import ChartCard from './ChartCard'

type Point = { emotion: string; count: number }
type Props = { range?: '7' | '30' | 'month' | 'all' }

function rangeLabel(range: Props['range']) {
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
      return 'Last 30 days'
  }
}

export default function EmotionFrequencyChart({ range = '30' }: Props) {
  const [data, setData] = useState<Point[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/events/emotion-frequency?range=${range}`)
        if (!res.ok) throw new Error('Failed to load emotion frequencies')
        const json = await res.json()
        if (!mounted) return
        setData(json as Point[])
      } catch (err: any) {
        if (!mounted) return
        setError(err?.message ?? String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [range])

  return (
    <ChartCard title="Emotion Frequency" subtitle={`Emotion count • ${rangeLabel(range)}`}>
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 320 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !data || data.length === 0 ? (
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          No emotions found for the selected range.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="emotion" tick={{ fontSize: 12 }} interval={0}>
              <Label value="Emotion" position="bottom" offset={10} />
            </XAxis>

            <YAxis allowDecimals={false}>
              <Label
                value="Count"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle' }}
              />
            </YAxis>

            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
              content={<CustomChartTooltip />}
            />

            <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

function CustomChartTooltip(props: any) {
  const { active, payload, label } = props
  const theme = useTheme()

  if (!active || !payload || !payload.length) return null

  const point = payload[0]

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 6,
        p: 1,
        minWidth: 140,
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        Count: {point?.value}
      </Typography>
    </Box>
  )
}
