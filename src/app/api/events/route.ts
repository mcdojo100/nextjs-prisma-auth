import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    title,
    description,
    intensity,
    importance,
    emotions,
    physicalSensations,
    category,
    verificationStatus,
    parentEventId,
  } = await req.json()

  if (!title || typeof intensity !== 'number' || typeof importance !== 'number') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
  if (verificationStatus !== undefined && typeof verificationStatus !== 'string') {
    return NextResponse.json(
      { error: 'verificationStatus must be a string if provided' },
      { status: 400 },
    )
  }
  // Validate parentEventId if provided: parent must exist and belong to the same user
  if (parentEventId) {
    const parentEvent = await db.event.findUnique({ where: { id: parentEventId } })
    if (!parentEvent) {
      return NextResponse.json({ error: 'Parent event not found' }, { status: 400 })
    }
    if (parentEvent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (parentEvent.parentEventId) {
      return NextResponse.json({ error: 'Cannot create sub-event under another sub-event' }, { status: 400 })
    }
  }
  const event = await db.event.create({
    // cast the `data` object to any so TypeScript matches the current prisma client schema reliably
    data: {
      title,
      description: description ?? '',
      intensity,
      importance,
      emotions: Array.isArray(emotions) ? emotions : [],
      physicalSensations: Array.isArray(physicalSensations) ? physicalSensations : [],
      category: category ?? null,
      verificationStatus: typeof verificationStatus === 'string' ? verificationStatus : undefined,
      parentEventId: parentEventId ?? null,
      userId: session.user.id,
    } as any,
  })

  return NextResponse.json(event, { status: 201 })
}
