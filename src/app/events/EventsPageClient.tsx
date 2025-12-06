// src/app/events/EventsPageClient.tsx
'use client'

import { useState } from 'react'
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import type { Event as PrismaEvent } from '@prisma/client'
import EventsList from './EventsList'
import EventForm from './EventForm'

type EventsPageClientProps = {
  events: PrismaEvent[]
}

export default function EventsPageClient({ events }: EventsPageClientProps) {
  const [openCreate, setOpenCreate] = useState(false)

  const handleOpenCreate = () => setOpenCreate(true)
  const handleCloseCreate = () => setOpenCreate(false)

  return (
    <Box sx={{ mt: 2 }}>
      {/* Title + Create button row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Events</Typography>

        <Button
          variant="contained"
          size="small"
          sx={{ height: '30.75px' }}
          onClick={handleOpenCreate}
        >
          Create Event
        </Button>
      </Box>

      {/* Events list */}
      <EventsList events={events} />

      {/* Create Event modal */}
      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>New Event</DialogTitle>
        <DialogContent dividers>
          <EventForm onSuccess={handleCloseCreate} onCancel={handleCloseCreate} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
