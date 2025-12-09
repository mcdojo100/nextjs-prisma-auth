import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// In Next 16 / Turbopack, `params` is a Promise
type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ✅ unwrap params
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
    verificationStatus, // ⭐ NEW
    tags,
    images,
    parentEventId,
  } = payload

  if (!title || typeof intensity !== 'number' || typeof importance !== 'number') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  // optional type check for the new field
  if (verificationStatus !== undefined && typeof verificationStatus !== 'string') {
    return NextResponse.json(
      { error: 'verificationStatus must be a string if provided' },
      { status: 400 },
    )
  }

  // optional type check for perception
  if (perception !== undefined && typeof perception !== 'string') {
    return NextResponse.json({ error: 'perception must be a string if provided' }, { status: 400 })
  }

  // ensure event exists and belongs to this user
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
      // If tags provided but not an array, ignore and keep existing tags.
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

  // If parentEventId provided, validate parent exists, belongs to user, and is not the event itself
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

    // Prevent circular parent relationships (A -> ... -> A)
    // Walk up the parent chain from the proposed parent and ensure we never reach the current event `id`.
    // Limit traversal to a sane number to avoid pathological loops.
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
      // fetch the next parent in the chain
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
        // allow updating the parent relationship when provided; if omitted, keep existing
        parentEventId:
          parentEventId === undefined ? existing.parentEventId : (parentEventId ?? null),
        // ⭐ Only update verificationStatus if a valid string was provided;
        // otherwise keep the existing value.
        verificationStatus:
          typeof verificationStatus === 'string' ? verificationStatus : existing.verificationStatus,
      },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('Error updating event:', err)
    // If the DB schema is not migrated, provide a helpful error message to the caller
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

  // ✅ unwrap params here too
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
