// src/app/events/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Box, Button, Typography, Divider, Chip } from '@mui/material'
import { db } from '@/lib/db'
import EditEventDialog from './EditEventDialog'
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
    where: { parentEventId: id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header: Event title + actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">{event.title}</Typography>
          {event.createdAt && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Created: {event.createdAt.toLocaleDateString()}
              </Typography>
              {event.verificationStatus && (
                <Chip
                  label={event.verificationStatus}
                  size="small"
                  color={
                    event.verificationStatus === 'Verified True'
                      ? 'success'
                      : event.verificationStatus === 'Verified False'
                        ? 'warning'
                        : event.verificationStatus === 'Pending'
                          ? 'info'
                          : event.verificationStatus === 'True without Verification'
                            ? 'info'
                            : event.verificationStatus === 'Question Mark'
                              ? 'warning'
                              : 'default'
                  }
                />
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Link href="/events">
            <Button variant="text">← Back to Events</Button>
          </Link>
          <EditEventDialog event={event} />
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <EventTabs eventId={event.id} logics={logics} subEvents={subEvents} />
    </Box>
  )
}
