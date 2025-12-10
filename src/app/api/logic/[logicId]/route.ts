// src/app/api/logic/[logicId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ logicId: string }> },
) {
  const { logicId } = await params

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

    // Fetch existing logic so we can preserve fields like images when omitted
    const existing = await db.logic.findUnique({ where: { id: logicId } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Normalize images similar to events: preserve existing when images is omitted
    let safeImages = existing.images ?? []
    if (images !== undefined) {
      if (Array.isArray(images)) {
        safeImages = Array.from(new Set(images.map((i: any) => String(i)).filter(Boolean)))
      } else {
        safeImages = existing.images ?? []
      }
    }

    const logic = await db.logic.update({
      where: { id: logicId },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        perception: perception ?? undefined,
        importance,
        status,
        facts,
        assumptions,
        patterns,
        actions,
        images: safeImages,
      },
    })

    return NextResponse.json(logic, { status: 200 })
  } catch (err) {
    console.error('Error updating logic:', err)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ logicId: string }> },
) {
  const { logicId } = await params

  try {
    // Optionally, you could verify ownership / session here
    await db.logic.delete({ where: { id: logicId } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Error deleting logic:', err)
    return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 })
  }
}
