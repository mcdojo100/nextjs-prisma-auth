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
    } = body

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
