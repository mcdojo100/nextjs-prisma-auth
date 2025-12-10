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

type Point = { date: string; avgImportance: number; count: number }

export default function ImportanceOverTime() {
  const [data, setData] = useState<Point[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/events/summary')
        if (!res.ok) throw new Error('Failed to load summary')
        const json = await res.json()
        if (!mounted) return
        setData(json as Point[])
      } catch (err: any) {
        setError(err?.message ?? String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (loading)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    )

  if (error)
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )

  if (!data || data.length === 0)
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Importance Over Time</Typography>
        <Typography variant="body2" color="text.secondary">
          No events found to display.
        </Typography>
      </Box>
    )

  return (
    <Box sx={{ pt: 2, pb: 2, px: 0 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Importance Over Time
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(d) => String(d).slice(5)}
            interval={'preserveStartEnd'}
          >
            <Label value="Date" position="bottom" offset={10} />
          </XAxis>
          <YAxis domain={[1, 10]} allowDecimals>
            <Label
              value="Avg importance"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip
            content={<CustomChartTooltip />}
            formatter={(value: any) => [value, 'Avg importance']}
          />
          <Line
            type="monotone"
            dataKey="avgImportance"
            stroke="#1976d2"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
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
        borderRadius: 1,
        boxShadow: 3,
        p: 1,
        minWidth: 140,
      }}
    >
      <Typography variant="caption" sx={{ color: theme.palette.text.primary, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
        Avg importance: {point?.value}
      </Typography>
      {point?.payload?.count !== undefined && (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Count: {point.payload.count}
        </Typography>
      )}
    </Box>
  )
}
