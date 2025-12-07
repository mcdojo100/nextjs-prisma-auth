// src/app/events/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Box, Button, Typography, Divider, Chip } from '@mui/material'
import EventHeaderCard from './EventHeaderCard'
import { db } from '@/lib/db'
import EventTabs from './EventTabs'
import { Event } from '@prisma/client'

type PageProps = {
  // Next 15/16: params is a Promise
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  // 1) Fetch the Event *without* include
  const event = await db.event.findUnique({
    where: { id },
  })

  if (!event) {
    notFound()
  }

  // 2) Fetch the Logics for this Event separately
  const logics = await db.logic.findMany({
    where: { eventId: id },
    orderBy: { createdAt: 'desc' },
  })

  // 3) Fetch Sub-events (child events)
  const subEvents = await db.event.findMany({
    where: { parentEventId: id, userId: event.userId },
    orderBy: { createdAt: 'desc' },
  })

  // src/app/events/[id]/page.tsx

  return (
    <Box sx={{ mt: 0 }}>
      {/* Back button above the header */}
      <Box sx={{ mb: 0 }}>
        <Link href="/events">
          <Button
            variant="text"
            startIcon={<span style={{ fontSize: '1.2rem' }}>←</span>}
            sx={{ textTransform: 'none', px: 0 }}
          >
            Back to Events
          </Button>
        </Link>
      </Box>

      {/* Main event details - styled like a sub-event card (click to edit) */}
      <EventHeaderCard event={event} />

      <Divider sx={{ mb: 3 }} />

      <EventTabs eventId={event.id} logics={logics} subEvents={subEvents} />
    </Box>
  )
}
