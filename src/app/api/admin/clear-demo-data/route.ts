import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin'

const prisma = new PrismaClient()

export async function POST() {
  const admin = await requireAdmin()
  if (!admin.ok || !admin.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: admin.email },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Admin user not found in DB' }, { status: 400 })
  }

  const deletedLogics = await prisma.logic.deleteMany({
    where: { isDemo: true, event: { userId: user.id } },
  })

  const deletedEvents = await prisma.event.deleteMany({
    where: { isDemo: true, userId: user.id },
  })

  return NextResponse.json({
    ok: true,
    message: 'Demo data cleared',
    deleted: { logics: deletedLogics.count, events: deletedEvents.count },
  })
}
