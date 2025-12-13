// src/app/activity/page.tsx
import { Box } from '@mui/material'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import ActivityClient from './ActivityClient'

export default async function ActivityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=/activity')

  // default range: last 30 days
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)

  const events = await db.event.findMany({
    where: {
      userId: session.user.id,
      occurredAt: { gte: start, lte: end },
    },
    orderBy: { occurredAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      occurredAt: true,
      intensity: true,
      parentEventId: true,
      tags: true,
    },
  })

  return (
    <Box sx={{ mt: 2 }}>
      <ActivityClient initialEvents={events} />
    </Box>
  )
}
