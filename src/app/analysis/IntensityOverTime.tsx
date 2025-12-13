// src/app/analysis/IntensityOverTime.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from 'recharts'
import ChartCard from './ChartCard'

type Point = { date: string; avgIntensity: number; count: number }
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

export default function IntensityOverTime({ range = '30' }: Props) {
  const [data, setData] = useState<Point[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await fetch(`/api/events/summary?range=${range}`)
        if (!res.ok) throw new Error('Failed to load summary')
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
    <ChartCard
      title="Intensity Over Time"
      subtitle={`Avg intensity per day • ${rangeLabel(range)}`}
    >
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !data || data.length === 0 ? (
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          No events found to display.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(d) => String(d).slice(5)}
              interval="preserveStartEnd"
            >
              <Label value="Date" position="bottom" offset={10} />
            </XAxis>
            <YAxis domain={[1, 10]} allowDecimals>
              <Label
                value="Avg intensity"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle' }}
              />
            </YAxis>
            <Tooltip content={<CustomChartTooltip />} />
            <Line
              type="monotone"
              dataKey="avgIntensity"
              stroke="#d32f2f"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
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
  const count = point?.payload?.count

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 6,
        p: 1,
        minWidth: 160,
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        Avg intensity: {point?.value}
      </Typography>
      {count !== undefined ? (
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Count: {count}
        </Typography>
      ) : null}
    </Box>
  )
}
