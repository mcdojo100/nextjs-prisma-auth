import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch events for the current user (occurredAt, importance, intensity)
  const events = await db.event.findMany({
    where: { userId: session.user.id },
    select: { occurredAt: true, importance: true, intensity: true },
  })

  // Aggregate by day (YYYY-MM-DD)
  const map = new Map<string, { sumImportance: number; sumIntensity: number; count: number }>()
  events.forEach((e) => {
    // Group by the actual occurred date (YYYY-MM-DD)
    const day = (e as any).occurredAt.toISOString().slice(0, 10)
    const cur = map.get(day) ?? { sumImportance: 0, sumIntensity: 0, count: 0 }
    cur.sumImportance += e.importance
    cur.sumIntensity += e.intensity
    cur.count += 1
    map.set(day, cur)
  })

  const data = Array.from(map.entries()).map(([date, { sumImportance, sumIntensity, count }]) => ({
    date,
    avgImportance: Number((sumImportance / count).toFixed(2)),
    avgIntensity: Number((sumIntensity / count).toFixed(2)),
    count,
  }))

  // sort by date ascending
  data.sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json(data)
}
