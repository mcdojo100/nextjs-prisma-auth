// src/app/events/EventsPageClient.tsx
'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material'
import type { Event as PrismaEvent } from '@prisma/client'
import EventsList from './EventsList'
import EventForm from './EventForm'

type EventsPageClientProps = {
  events: PrismaEvent[]
}

export default function EventsPageClient({ events }: EventsPageClientProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const uniqueTags = useMemo(() => {
    const s = new Set<string>()
    for (const e of events) {
      const tags = (e as any).tags
      if (Array.isArray(tags)) tags.forEach((t) => s.add(t))
    }
    return Array.from(s).sort()
  }, [events])

  const handleOpenCreate = () => setOpenCreate(true)
  const handleCloseCreate = () => setOpenCreate(false)

  return (
    <Box sx={{ mt: 2 }}>
      {/* Title + Create button row */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h4">Events</Typography>

          <Box>
            <Button
              variant="contained"
              size="small"
              sx={{ height: '30.75px' }}
              onClick={handleOpenCreate}
            >
              Create Event
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Events list */}
      <EventsList events={events} />

      {/* Create Event modal */}
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
        }}
      >
        <DialogTitle>New Event</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
          <EventForm onSuccess={handleCloseCreate} onCancel={handleCloseCreate} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button type="submit" form="event-form" variant="contained">
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
