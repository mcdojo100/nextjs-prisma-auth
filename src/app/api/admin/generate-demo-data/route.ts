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

  // If you want to prevent repeated generation, uncomment this:
  // const already = await prisma.event.count({ where: { userId: user.id, isDemo: true } });
  // if (already > 0) return NextResponse.json({ ok: true, message: "Demo data already exists", demoEvents: already });

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
    emotions: ['Focused'],
    physicalSensations: [],
    tags: [batchTag, parentTag],
    images: [],
    category: 'Demo',
    verificationStatus: 'Pending',

    occurredAt: randomDateWithinLastYear(),
  }))

  // Chunk to keep queries snappy & avoid parameter limits
  for (const c of chunk(parentsData, 500)) {
    await prisma.event.createMany({ data: c })
  }

  // Fetch parent IDs back (createMany doesn't return IDs)
  const parentEvents = await prisma.event.findMany({
    where: {
      userId: user.id,
      isDemo: true,
      tags: { has: batchTag },
      // ensure we only pull parents
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
      emotions: [],
      physicalSensations: [],
      tags: [batchTag, subTag],
      images: [],
      category: 'Demo',
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

  // 11k rows: chunk into ~1000 per query for speed/stability
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
