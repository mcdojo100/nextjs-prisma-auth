'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
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

type Point = { emotion: string; count: number }

export default function EmotionFrequencyChart() {
  const [range, setRange] = useState<'7' | '30' | 'month' | 'all'>('30')
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
    <Box sx={{ pt: 2, pb: 2, px: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Emotion Frequency</Typography>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="efc-range-label">Time range</InputLabel>
          <Select
            labelId="efc-range-label"
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

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            height: 320,
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : !data || data.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No emotions found for the selected range.
          </Typography>
        </Box>
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
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              content={<CustomChartTooltip />}
              formatter={(value) => [value, 'Count']}
            />
            <Bar dataKey="count" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      )}
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
        Count: {point?.value}
      </Typography>
    </Box>
  )
}
