// src/app/events/page.tsx
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventsPageClient from './EventsPageClient'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/events')
  }

  // Select explicit fields to avoid referencing newly-added DB columns
  // while migrations are being verified/applied.
  const events = await db.event.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      intensity: true,
      importance: true,
      emotions: true,
      physicalSensations: true,
      tags: true,
      images: true,
      category: true,
      verificationStatus: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      parentEventId: true,
      perception: true,
    },
  })

  return <EventsPageClient events={events} />
}
