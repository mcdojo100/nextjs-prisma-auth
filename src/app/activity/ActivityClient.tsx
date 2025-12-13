'use client'

import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import EventForm from '../events/EventForm'
import CalendarView from './CalendarView'
import TimelineView, { LiteEvent, TimelineFilter } from './TimelineView'
import TagFilter from '../events/TagFilter'

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

  // Edit dialog state for clicking existing events
  const [editOpen, setEditOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<LiteEvent | null>(null)

  // Calendar state
  const [month, setMonth] = useState(dayjs())
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)

  // Timeline filter state
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all')

  const events = useMemo(() => {
    return initialEvents.map((e) => ({
      ...e,
      occurredAt: typeof e.occurredAt === 'string' ? new Date(e.occurredAt) : e.occurredAt,
    }))
  }, [initialEvents])

  // --- Timeline grouping (with filter applied) ---
  const filteredEventsAll = useMemo(() => {
    if (timelineFilter === 'all') return events
    if (timelineFilter === 'parents') return events.filter((e) => !e.parentEventId)
    return events.filter((e) => !!e.parentEventId)
  }, [events, timelineFilter])

  const groupedByDay = useMemo(() => {
    const map = new Map<string, LiteEvent[]>()
    for (const e of filteredEventsAll) {
      const key = dayjs(e.occurredAt).format('YYYY-MM-DD')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }

    for (const [k, arr] of map) {
      arr.sort((a, b) => +new Date(b.occurredAt as any) - +new Date(a.occurredAt as any))
      map.set(k, arr)
    }

    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [filteredEventsAll])

  // --- Calendar intensity counts for the displayed month ---
  const monthCounts = useMemo(() => {
    const start = month.startOf('month')
    const end = month.endOf('month')
    const counts = new Map<string, number>()

    for (const e of filteredEventsAll) {
      const d = dayjs(e.occurredAt)
      if (d.isBefore(start, 'day') || d.isAfter(end, 'day')) continue
      const key = toDayKey(d)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return counts
  }, [filteredEventsAll, month])

  const selectedDayEvents = useMemo(() => {
    if (!selectedDayKey) return []
    return filteredEventsAll
      .filter((e) => dayjs(e.occurredAt).format('YYYY-MM-DD') === selectedDayKey)
      .sort((a, b) => +new Date(b.occurredAt as any) - +new Date(a.occurredAt as any))
  }, [filteredEventsAll, selectedDayKey])

  function openAddForDate(date: Date) {
    setAddPrefillDate(date)
    setAddOpen(true)
  }

  function openEdit(e: LiteEvent) {
    setEditEvent(e)
    setEditOpen(true)
  }

  return (
    <Box>
      {/* Top controls */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {/* First row: view toggle only */}
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <ToggleButtonGroup
            exclusive
            value={view}
            onChange={(_, v) => v && setView(v)}
            size="small"
          >
            <ToggleButton value="calendar">Calendar</ToggleButton>
            <ToggleButton value="timeline">Timeline</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Second row: right-aligned controls (filter next to Add button) */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TagFilter
              events={events as any}
              filter={timelineFilter}
              onFilterChange={setTimelineFilter}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openAddForDate(new Date())}
            >
              Add event
            </Button>
          </Box>
        </Stack>
      </Stack>

      {view === 'timeline' ? (
        <TimelineView
          groupedByDay={groupedByDay}
          filter={timelineFilter}
          onChangeFilter={setTimelineFilter}
          onAddForDay={(dayKey) =>
            openAddForDate(dayjs(dayKey).hour(12).minute(0).second(0).toDate())
          }
          onOpenEdit={openEdit}
        />
      ) : (
        <CalendarView
          month={month}
          onMonthChange={setMonth}
          counts={monthCounts}
          selectedDayKey={selectedDayKey}
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

          <Stack direction="row" spacing={1} alignItems="center">
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

            <IconButton aria-label="Close" onClick={() => setDayDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          {selectedDayEvents.map((e) => (
            <Card key={e.id} sx={{ width: '100%', position: 'relative', borderColor: 'divider' }}>
              <CardActionArea component="div" onClick={() => openEdit(e)}>
                <CardContent sx={{ pr: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={600}>{e.title}</Typography>
                    <Chip size="small" label={dayjs(e.occurredAt).format('h:mm A')} />
                  </Stack>
                  {e.description ? (
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                      {e.description}
                    </Typography>
                  ) : null}
                </CardContent>
              </CardActionArea>
            </Card>
          ))}

          {selectedDayEvents.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              No events for this day.
            </Typography>
          ) : null}
        </Stack>
      </Drawer>

      {/* Add Event (Dialog) */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
        }}
      >
        <DialogTitle>New Event</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
          <EventForm
            initialOccurredAt={addPrefillDate}
            onSuccess={() => setAddOpen(false)}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button type="submit" form="event-form" variant="contained">
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit existing event dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
        }}
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
          <EventForm
            event={editEvent as any}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button type="submit" form="event-form" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
