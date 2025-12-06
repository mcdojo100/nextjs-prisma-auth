// src/app/events/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Box, Button, Typography, Divider, Chip, Card, CardContent } from '@mui/material'
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

      {/* Main event details - styled like a sub-event card */}
      <Card
        sx={{
          width: '100%',
          position: 'relative',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <CardContent sx={{ pr: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5,
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" noWrap>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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

              <EditEventDialog event={event} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}
            </Typography>
          </Box>

          {event.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.5,
              }}
            >
              {event.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <EventTabs eventId={event.id} logics={logics} subEvents={subEvents} />
    </Box>
  )
}
