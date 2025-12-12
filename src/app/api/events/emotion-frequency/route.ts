import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function parseRange(range?: string) {
  if (!range || range === 'all') return null
  if (range === 'month') {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  const days = Number(range)
  if (Number.isNaN(days) || days <= 0) return null
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days + 1)
  cutoff.setHours(0, 0, 0, 0)
  return cutoff
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const range = url.searchParams.get('range') ?? '30'
  const cutoff = parseRange(range)

  // fetch events for user, with occurredAt and emotions array
  const events = await db.event.findMany({
    where: { userId: session.user.id },
    select: { occurredAt: true, emotions: true },
  })

  const map = new Map<string, number>()

  for (const e of events) {
    // use occurredAt (the actual event time) for range filtering
    if (cutoff && (e as any).occurredAt < cutoff) continue
    const emotions = (e as any).emotions
    if (!Array.isArray(emotions)) continue
    for (const raw of emotions) {
      if (!raw) continue
      const emo = String(raw).trim()
      if (!emo) continue
      map.set(emo, (map.get(emo) ?? 0) + 1)
    }
  }

  const data = Array.from(map.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json(data)
}
