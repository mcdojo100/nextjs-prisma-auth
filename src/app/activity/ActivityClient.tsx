'use client'

import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

// You can reuse your existing EventForm in a Dialog
import EventForm from '../events/EventForm' // adjust path to your actual EventForm

type LiteEvent = {
  id: string
  title: string
  description: string
  occurredAt: Date | string
  intensity: number
  parentEventId: string | null
}

type Props = {
  initialEvents: LiteEvent[]
}

type ViewMode = 'timeline' | 'calendar'

function toDayKey(d: dayjs.Dayjs) {
  return d.format('YYYY-MM-DD')
}

export default function ActivityClient({ initialEvents }: Props) {
  const [view, setView] = useState<ViewMode>('calendar')

  // Quick add modal state
  const [addOpen, setAddOpen] = useState(false)
  const [addPrefillDate, setAddPrefillDate] = useState<Date | null>(null)

  // Calendar state
  const [month, setMonth] = useState(dayjs()) // current month
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)

  const events = useMemo(() => {
    // normalize occurredAt to Date objects
    return initialEvents.map((e) => ({
      ...e,
      occurredAt: typeof e.occurredAt === 'string' ? new Date(e.occurredAt) : e.occurredAt,
    }))
  }, [initialEvents])

  // --- Timeline grouping ---
  const groupedByDay = useMemo(() => {
    const map = new Map<string, LiteEvent[]>()
    for (const e of events) {
      const key = dayjs(e.occurredAt).format('YYYY-MM-DD')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }

    // ensure each group is time-sorted (desc)
    for (const [k, arr] of map) {
      arr.sort((a, b) => +new Date(b.occurredAt as any) - +new Date(a.occurredAt as any))
      map.set(k, arr)
    }

    // newest day first
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [events])

  // --- Calendar intensity counts for the displayed month ---
  const monthCounts = useMemo(() => {
    const start = month.startOf('month')
    const end = month.endOf('month')
    const counts = new Map<string, number>()

    for (const e of events) {
      const d = dayjs(e.occurredAt)
      if (d.isBefore(start, 'day') || d.isAfter(end, 'day')) continue
      const key = toDayKey(d)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return counts
  }, [events, month])

  const selectedDayEvents = useMemo(() => {
    if (!selectedDayKey) return []
    return events
      .filter((e) => dayjs(e.occurredAt).format('YYYY-MM-DD') === selectedDayKey)
      .sort((a, b) => +new Date(b.occurredAt as any) - +new Date(a.occurredAt as any))
  }, [events, selectedDayKey])

  function openAddForDate(date: Date) {
    setAddPrefillDate(date)
    setAddOpen(true)
  }

  return (
    <Box>
      {/* Top controls */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <ToggleButtonGroup exclusive value={view} onChange={(_, v) => v && setView(v)} size="small">
          <ToggleButton value="calendar">Calendar</ToggleButton>
          <ToggleButton value="timeline">Timeline</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openAddForDate(new Date())}
        >
          Add event
        </Button>
      </Stack>

      {view === 'timeline' ? (
        <TimelineView
          groupedByDay={groupedByDay}
          onAddForDay={(dayKey) => {
            // prefill date at noon local for stability
            openAddForDate(dayjs(dayKey).hour(12).minute(0).second(0).toDate())
          }}
        />
      ) : (
        <CalendarView
          month={month}
          onMonthChange={setMonth}
          counts={monthCounts}
          onPickDay={(dayKey) => {
            setSelectedDayKey(dayKey)
            setDayDrawerOpen(true)
          }}
          onAddForDay={(dayKey) =>
            openAddForDate(dayjs(dayKey).hour(12).minute(0).second(0).toDate())
          }
        />
      )}

      {/* Day drawer (calendar click) */}
      <Drawer
        anchor="right"
        open={dayDrawerOpen}
        onClose={() => setDayDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 2 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">
            {selectedDayKey ? dayjs(selectedDayKey).format('ddd, MMM D') : 'Day'}
          </Typography>

          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (!selectedDayKey) return
              openAddForDate(dayjs(selectedDayKey).hour(12).minute(0).second(0).toDate())
            }}
          >
            Add
          </Button>
        </Stack>

        <Stack spacing={1}>
          {selectedDayEvents.map((e) => (
            <Box
              key={e.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.25,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={600}>{e.title}</Typography>
                <Chip size="small" label={dayjs(e.occurredAt).format('h:mm A')} />
              </Stack>
              {e.description ? (
                <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                  {e.description}
                </Typography>
              ) : null}
            </Box>
          ))}

          {selectedDayEvents.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              No events for this day.
            </Typography>
          ) : null}
        </Stack>
      </Drawer>

      {/* Add Event dialog */}
      {/* Reuse your existing modal pattern – simplest: render EventForm inside a MUI Dialog in the parent that calls setAddOpen(false) on success/cancel.
          If your EventForm already lives inside a Dialog elsewhere, tell me how you’re doing it and I’ll match it exactly.
      */}
      {addOpen ? (
        <EventForm
          initialOccurredAt={addPrefillDate}
          onSuccess={() => setAddOpen(false)}
          onCancel={() => setAddOpen(false)}
        />
      ) : null}
    </Box>
  )
}

function TimelineView({
  groupedByDay,
  onAddForDay,
}: {
  groupedByDay: [string, LiteEvent[]][]
  onAddForDay: (dayKey: string) => void
}) {
  return (
    <Stack spacing={2}>
      {groupedByDay.map(([dayKey, items]) => (
        <Box key={dayKey}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 1,
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
              py: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {dayjs(dayKey).format('dddd, MMM D')}
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={() => onAddForDay(dayKey)}>
              Add
            </Button>
          </Stack>

          <Stack spacing={1}>
            {items.map((e) => (
              <Box
                key={e.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.25,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={600}>{e.title}</Typography>
                  <Chip size="small" label={dayjs(e.occurredAt).format('h:mm A')} />
                </Stack>
                {e.description ? (
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                    {e.description}
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

function CalendarView({
  month,
  onMonthChange,
  counts,
  onPickDay,
  onAddForDay,
}: {
  month: dayjs.Dayjs
  onMonthChange: (d: dayjs.Dayjs) => void
  counts: Map<string, number>
  onPickDay: (dayKey: string) => void
  onAddForDay: (dayKey: string) => void
}) {
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

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Button onClick={() => onMonthChange(month.subtract(1, 'month'))}>Prev</Button>
        <Typography variant="h6">{month.format('MMMM YYYY')}</Typography>
        <Button onClick={() => onMonthChange(month.add(1, 'month'))}>Next</Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <Typography key={d} variant="caption" sx={{ opacity: 0.7, textAlign: 'center' }}>
            {d}
          </Typography>
        ))}

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
                minHeight: 84,
                p: 1,
                opacity: inMonth ? 1 : 0.5,
                bgcolor: `rgba(0,0,0,${opacityByLevel[level]})`,
                position: 'relative',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight={700}>
                  {d.date()}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddForDay(dayKey)
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              {n > 0 ? (
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  {n} event{n === 1 ? '' : 's'}
                </Typography>
              ) : null}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
