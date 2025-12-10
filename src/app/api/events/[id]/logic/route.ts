// src/app/api/events/[id]/logic/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // this is the eventId

  try {
    const body = await request.json()
    const {
      title,
      description,
      perception,
      importance,
      status,
      facts,
      assumptions,
      patterns,
      actions,
      images,
    } = body

    // Server-side validation: only `title` is required. Other fields are optional
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Normalize/assign defaults for optional fields
    const safeImportance =
      typeof importance === 'number' && !Number.isNaN(importance) ? importance : 5
    const safeImportanceClamped = Math.min(10, Math.max(1, safeImportance))
    const safeStatus = typeof status === 'string' && status ? status : 'Open'
    const safePerception =
      typeof perception === 'string' && ['Positive', 'Neutral', 'Negative'].includes(perception)
        ? perception
        : 'Neutral'
    const safeFacts = typeof facts === 'string' ? facts : ''
    const safeAssumptions = typeof assumptions === 'string' ? assumptions : ''
    const safePatterns = typeof patterns === 'string' ? patterns : ''
    const safeActions = typeof actions === 'string' ? actions : ''

    // Optional: verify event exists
    const event = await db.event.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Normalize images if provided; otherwise default to empty array
    let safeImages: string[] = []
    if (images !== undefined) {
      if (Array.isArray(images)) {
        safeImages = Array.from(new Set(images.map((i: any) => String(i)).filter(Boolean)))
      } else {
        safeImages = []
      }
    }

    const logic = await db.logic.create({
      data: {
        title: title ?? '',
        description: description ?? '',
        perception: safePerception,
        importance: safeImportanceClamped,
        status: safeStatus,
        facts: safeFacts,
        assumptions: safeAssumptions,
        patterns: safePatterns,
        actions: safeActions,
        images: safeImages,
        eventId: id,
      },
    })

    return NextResponse.json(logic, { status: 201 })
  } catch (err) {
    console.error('Error creating logic:', err)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
