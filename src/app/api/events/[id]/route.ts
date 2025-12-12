import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// In Next 16 / Turbopack, `params` is a Promise
type RouteContext = {
  params: Promise<{ id: string }>
}

function parseDateLike(input: unknown): Date | null {
  if (input == null) return null
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const payload = await req.json()
  const {
    title,
    description,
    perception,
    intensity,
    importance,
    emotions,
    physicalSensations,
    category,
    verificationStatus,
    tags,
    images,
    parentEventId,
    // ✅ NEW (accept correct + common-typo)
    occurredAt,
    // Accept client typo `occuredAt` too
    occuredAt: _occuredAt,
  } = payload

  if (!title || typeof intensity !== 'number' || typeof importance !== 'number') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  // ✅ Validate occurredAt (only if provided). Accept either spelling.
  let occurredAtDate: Date | undefined = undefined
  const inputOccurred = occurredAt !== undefined ? occurredAt : (_occuredAt as unknown)
  if (inputOccurred !== undefined) {
    const parsed = parseDateLike(inputOccurred)
    if (!parsed) {
      return NextResponse.json(
        { error: 'occurredAt must be a valid date/time (ISO string recommended)' },
        { status: 400 },
      )
    }
    occurredAtDate = parsed
  }

  if (verificationStatus !== undefined && typeof verificationStatus !== 'string') {
    return NextResponse.json(
      { error: 'verificationStatus must be a string if provided' },
      { status: 400 },
    )
  }

  if (perception !== undefined && typeof perception !== 'string') {
    return NextResponse.json({ error: 'perception must be a string if provided' }, { status: 400 })
  }

  const existing = await db.event.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Normalize tags if provided; if not provided, preserve existing tags.
  let safeTags = existing.tags
  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      safeTags = Array.from(new Set(tags.map((t: any) => String(t).toLowerCase()).filter(Boolean)))
    } else {
      safeTags = existing.tags
    }
  }

  // Normalize images if provided; preserve existing if omitted.
  let safeImages = existing.images ?? []
  if (images !== undefined) {
    if (Array.isArray(images)) {
      safeImages = Array.from(new Set(images.map((i: any) => String(i)).filter(Boolean)))
    } else {
      safeImages = existing.images ?? []
    }
  }

  // Parent validation (unchanged)
  if (parentEventId !== undefined && parentEventId !== null) {
    if (parentEventId === id) {
      return NextResponse.json({ error: 'An event cannot be its own parent' }, { status: 400 })
    }
    const parentEvent = await db.event.findUnique({ where: { id: parentEventId } })
    if (!parentEvent) {
      return NextResponse.json({ error: 'Parent event not found' }, { status: 400 })
    }
    if (parentEvent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let ancestorId: string | null = parentEvent.parentEventId ?? null
    const MAX_CHAIN = 100
    let steps = 0
    while (ancestorId) {
      if (ancestorId === id) {
        return NextResponse.json(
          { error: 'Circular parent relationship detected' },
          { status: 400 },
        )
      }
      const next = await db.event.findUnique({ where: { id: ancestorId } })
      if (!next) break
      ancestorId = next.parentEventId ?? null
      steps += 1
      if (steps >= MAX_CHAIN) {
        return NextResponse.json({ error: 'Parent chain too deep or cyclic' }, { status: 400 })
      }
    }
  }

  try {
    const updated = await db.event.update({
      where: { id },
      data: {
        title,
        description: description ?? '',
        perception: typeof perception === 'string' ? perception : existing.perception,
        intensity,
        importance,
        emotions: Array.isArray(emotions) ? emotions : [],
        physicalSensations: Array.isArray(physicalSensations) ? physicalSensations : [],
        tags: safeTags,
        images: safeImages,
        category: category ?? null,

        parentEventId:
          parentEventId === undefined ? existing.parentEventId : (parentEventId ?? null),

        verificationStatus:
          typeof verificationStatus === 'string' ? verificationStatus : existing.verificationStatus,

        // ✅ Only update occurredAt if provided; otherwise keep existing
        occurredAt: occurredAtDate ?? (existing as any).occurredAt ?? existing.createdAt,
      },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('Error updating event:', err)
    return NextResponse.json(
      { error: 'Failed to update event', details: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const existing = await db.event.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await db.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
