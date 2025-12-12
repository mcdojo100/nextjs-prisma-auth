'use client'

import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import dayjs from 'dayjs'

type Props = {
  month: dayjs.Dayjs
  onMonthChange: (d: dayjs.Dayjs) => void
  counts: Map<string, number>
  onPickDay: (dayKey: string) => void
  onAddForDay: (dayKey: string) => void
}

function toDayKey(d: dayjs.Dayjs) {
  return d.format('YYYY-MM-DD')
}

export default function CalendarView({
  month,
  onMonthChange,
  counts,
  onPickDay,
  onAddForDay,
}: Props) {
  const start = month.startOf('month')
  const firstGridDay = start.startOf('week') // Sunday-start; adjust if you want Monday
  const days = Array.from({ length: 42 }, (_, i) => firstGridDay.add(i, 'day'))

  function intensityLevel(n: number) {
    if (n <= 0) return 0
    if (n <= 2) return 1
    if (n <= 5) return 2
    if (n <= 9) return 3
    return 4
  }

  // simple opacity scale (no hard-coded colors)
  const opacityByLevel = [0, 0.08, 0.14, 0.2, 0.28]

  const weekdays = [
    { full: 'Sun', short: 'S' },
    { full: 'Mon', short: 'M' },
    { full: 'Tue', short: 'T' },
    { full: 'Wed', short: 'W' },
    { full: 'Thu', short: 'T' },
    { full: 'Fri', short: 'F' },
    { full: 'Sat', short: 'S' },
  ]

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Month header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1, gap: 1 }}
      >
        <Button size="small" onClick={() => onMonthChange(month.subtract(1, 'month'))}>
          Prev
        </Button>

        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            flex: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {month.format('MMMM YYYY')}
        </Typography>

        <Button size="small" onClick={() => onMonthChange(month.add(1, 'month'))}>
          Next
        </Button>
      </Stack>

      {/* Grid wrapper */}
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <Box
          sx={{
            display: 'grid',
            // ✅ key: allow columns to shrink instead of forcing overflow
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: { xs: 0.5, sm: 1 },
            width: '100%',
          }}
        >
          {/* Weekday headers */}
          {weekdays.map((d) => (
            <Typography
              key={d.full}
              variant="caption"
              sx={{
                opacity: 0.7,
                textAlign: 'center',
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                userSelect: 'none',
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {d.full}
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {d.short}
              </Box>
            </Typography>
          ))}

          {/* Day cells */}
          {days.map((d) => {
            const dayKey = toDayKey(d)
            const n = counts.get(dayKey) ?? 0
            const level = intensityLevel(n)
            const inMonth = d.month() === month.month()

            return (
              <Box
                key={dayKey}
                onClick={() => onPickDay(dayKey)}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  minHeight: { xs: 58, sm: 84 },
                  p: { xs: 0.5, sm: 1 },
                  opacity: inMonth ? 1 : 0.45,
                  bgcolor: `rgba(0,0,0,${opacityByLevel[level]})`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {d.date()}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddForDay(dayKey)
                    }}
                    sx={{ p: { xs: 0.25, sm: 0.5 } }}
                    aria-label="add event"
                  >
                    <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                  </IconButton>
                </Stack>

                {n > 0 ? (
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.75,
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {n} event{n === 1 ? '' : 's'}
                  </Typography>
                ) : null}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
