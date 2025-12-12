import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin'
import crypto from 'crypto'

const prisma = new PrismaClient()

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

function randomDateWithinLastYear() {
  const now = Date.now()
  const days = randomInt(0, 365)
  const ms = days * 24 * 60 * 60 * 1000 + randomInt(0, 24 * 60 * 60 * 1000)
  return new Date(now - ms)
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// random subset helper (0..maxCount items)
function randomSubset<T>(arr: T[], maxCount: number) {
  const copy = [...arr]
  const count = randomInt(0, Math.min(maxCount, copy.length))
  const result: T[] = []
  for (let i = 0; i < count; i++) {
    const idx = randomInt(0, copy.length - 1)
    result.push(copy[idx])
    copy.splice(idx, 1)
  }
  return result
}

const EMOTIONS = [
  'anger',
  'sadness',
  'anxiety',
  'numbness',
  'confusion',
  'shame',
  'hope',
  'calm',
] as const

const PHYSICAL_SENSATIONS = [
  'Tight Chest',
  'Butterflies/Stomach Flutters',
  'Headache/Pressure',
  'Warmth or Heat in the Body',
  'Shaky or Trembling',
  'Tension in Shoulders/Neck',
  'Shortness of Breath',
  'Fatigue/Heavy Limbs',
] as const

const CATEGORIES = ['work', 'relationship', 'self', 'family', 'health'] as const

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
    return NextResponse.json(
      { error: 'Admin user not found in DB. Sign in once, then retry.' },
      { status: 400 },
    )
  }

  const batchTag = `demo-batch:${crypto.randomUUID()}`
  const parentTag = 'demo-parent'
  const subTag = 'demo-sub'

  const parentCount = 100
  const subPerParent = 10
  const notesPerEvent = 10

  const statuses = ['Open', 'Needs Watch', 'Resolved'] as const
  const perceptions = ['Neutral', 'Positive', 'Negative'] as const

  // ---------------------------
  // 1) Create parent events (createMany)
  // ---------------------------
  const parentsData = Array.from({ length: parentCount }).map((_, i) => ({
    userId: user.id,
    isDemo: true,

    title: `Demo Parent Event #${i + 1}`,
    description: `Seeded demo parent event ${i + 1}.`,
    intensity: randomInt(1, 10),
    importance: randomInt(1, 10),

    perception: randomItem([...perceptions]),
    emotions: randomSubset([...EMOTIONS], 3), // 0..3 emotions
    physicalSensations: randomSubset([...PHYSICAL_SENSATIONS], 3), // 0..3 sensations
    tags: [batchTag, parentTag],
    images: [],
    category: randomItem([...CATEGORIES]),
    verificationStatus: 'Pending',

    occurredAt: randomDateWithinLastYear(),
  }))

  for (const c of chunk(parentsData, 500)) {
    await prisma.event.createMany({ data: c })
  }

  const parentEvents = await prisma.event.findMany({
    where: {
      userId: user.id,
      isDemo: true,
      tags: { has: batchTag },
      parentEventId: null,
    },
    select: { id: true },
  })

  // ---------------------------
  // 2) Create sub-events (createMany)
  // ---------------------------
  const subEventsData = parentEvents.flatMap((p, pi) =>
    Array.from({ length: subPerParent }).map((_, si) => ({
      userId: user.id,
      isDemo: true,
      parentEventId: p.id,

      title: `Demo Sub Event P${pi + 1}.${si + 1}`,
      description: `Seeded demo sub-event ${pi + 1}.${si + 1}.`,
      intensity: randomInt(1, 10),
      importance: randomInt(1, 10),

      perception: randomItem([...perceptions]),
      emotions: randomSubset([...EMOTIONS], 3),
      physicalSensations: randomSubset([...PHYSICAL_SENSATIONS], 3),
      tags: [batchTag, subTag],
      images: [],
      category: randomItem([...CATEGORIES]),
      verificationStatus: 'Pending',

      occurredAt: randomDateWithinLastYear(),
    })),
  )

  for (const c of chunk(subEventsData, 500)) {
    await prisma.event.createMany({ data: c })
  }

  // ---------------------------
  // 3) Fetch all event IDs in this batch (parents + subs)
  // ---------------------------
  const allEvents = await prisma.event.findMany({
    where: {
      userId: user.id,
      isDemo: true,
      tags: { has: batchTag },
    },
    select: { id: true },
  })

  // ---------------------------
  // 4) Create notes (Logic) for every event (createMany)
  // ---------------------------
  const logicRows = allEvents.flatMap((e) =>
    Array.from({ length: notesPerEvent }).map((_, li) => ({
      eventId: e.id,
      isDemo: true,

      title: `Demo Note #${li + 1}`,
      description: 'Generated demo note for UI testing.',
      importance: randomInt(1, 10),
      status: randomItem([...statuses]),

      facts: 'This is demo data created in production for testing UI flows.',
      assumptions: 'These notes help validate sorting/filtering/editing behaviors.',
      patterns: 'Large datasets reveal performance and UX issues.',
      actions: 'Test search, status filters, nested events, and editing.',

      perception: randomItem([...perceptions]),
      images: [],
    })),
  )

  for (const c of chunk(logicRows, 1000)) {
    await prisma.logic.createMany({ data: c })
  }

  return NextResponse.json({
    ok: true,
    message: 'Demo data generated',
    batchTag,
    created: {
      parentEvents: parentEvents.length,
      subEvents: subEventsData.length,
      totalEvents: allEvents.length,
      notes: logicRows.length,
    },
  })
}
