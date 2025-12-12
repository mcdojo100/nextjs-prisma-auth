import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function parseDateLike(input: unknown): Date | null {
  if (input == null) return null
  if (typeof input === 'string' || typeof input === 'number') {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const {
    title,
    description,
    intensity,
    importance,
    emotions,
    physicalSensations,
    tags,
    images,
    category,
    verificationStatus,
    perception,
    parentEventId,
    // ✅ NEW (accept correct + common-typo)
    occurredAt,
    // Accept client typo `occuredAt` as well; we'll normalize below
    occuredAt: _occuredAt,
  } = body

  if (!title || typeof intensity !== 'number' || typeof importance !== 'number') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  if (verificationStatus !== undefined && typeof verificationStatus !== 'string') {
    return NextResponse.json(
      { error: 'verificationStatus must be a string if provided' },
      { status: 400 },
    )
  }

  // ✅ Validate occurredAt only if provided
  let occurredAtDate: Date | undefined
  // Normalize input: prefer `occurredAt`, fall back to common-typo `occuredAt`
  const inputOccurred = occurredAt !== undefined ? occurredAt : (_occuredAt as unknown)

  if (inputOccurred !== undefined) {
    const parsed = parseDateLike(inputOccurred)
    if (!parsed) {
      return NextResponse.json(
        { error: 'occurredAt must be a valid ISO date string' },
        { status: 400 },
      )
    }
    occurredAtDate = parsed
  }

  // Validate parentEventId if provided: parent must exist and belong to the same user
  if (parentEventId !== undefined && parentEventId !== null) {
    const parentEvent = await db.event.findUnique({ where: { id: parentEventId } })
    if (!parentEvent) {
      return NextResponse.json({ error: 'Parent event not found' }, { status: 400 })
    }
    if (parentEvent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (parentEvent.parentEventId) {
      return NextResponse.json(
        { error: 'Cannot create sub-event under another sub-event' },
        { status: 400 },
      )
    }
  }

  const event = await db.event.create({
    data: {
      title,
      description: description ?? '',
      perception: typeof perception === 'string' ? perception : undefined,
      intensity,
      importance,
      emotions: Array.isArray(emotions) ? emotions : [],
      physicalSensations: Array.isArray(physicalSensations) ? physicalSensations : [],
      tags: Array.isArray(tags)
        ? Array.from(new Set(tags.map((t: any) => String(t).toLowerCase()).filter(Boolean)))
        : [],
      images: Array.isArray(images)
        ? Array.from(new Set(images.map((i: any) => String(i)).filter(Boolean)))
        : [],
      category: category ?? null,
      verificationStatus: typeof verificationStatus === 'string' ? verificationStatus : undefined,
      parentEventId: parentEventId ?? null,
      userId: session.user.id,

      // ✅ Save occurredAt if provided; otherwise Prisma default(now()) handles it
      ...(occurredAtDate ? { occurredAt: occurredAtDate } : {}),
    } as any,
  })

  return NextResponse.json(event, { status: 201 })
}
