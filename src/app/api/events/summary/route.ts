import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch events for the current user (createdAt + importance)
  const events = await db.event.findMany({
    where: { userId: session.user.id },
    select: { createdAt: true, importance: true },
  })

  // Aggregate by day (YYYY-MM-DD)
  const map = new Map<string, { sum: number; count: number }>()
  events.forEach((e) => {
    const day = e.createdAt.toISOString().slice(0, 10)
    const cur = map.get(day) ?? { sum: 0, count: 0 }
    cur.sum += e.importance
    cur.count += 1
    map.set(day, cur)
  })

  const data = Array.from(map.entries()).map(([date, { sum, count }]) => ({
    date,
    avgImportance: Number((sum / count).toFixed(2)),
    count,
  }))

  // sort by date ascending
  data.sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json(data)
}
