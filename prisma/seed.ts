// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// ---------- helpers ----------
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

function randomSubset<T>(arr: T[], maxCount: number): T[] {
  const copy = [...arr]
  const result: T[] = []
  const count = randomInt(1, Math.min(maxCount, arr.length))
  for (let i = 0; i < count; i++) {
    const idx = randomInt(0, copy.length - 1)
    result.push(copy[idx])
    copy.splice(idx, 1)
  }
  return result
}

// Spread events over last 365 days
function randomDateWithinLastYear() {
  const now = new Date()
  const daysAgo = randomInt(0, 364)
  const d = new Date(now)
  d.setDate(now.getDate() - daysAgo)
  d.setHours(randomInt(7, 22), randomInt(0, 59), 0, 0)
  return d
}

// Generate deterministic-ish IDs (good enough for seed data)
function makeEventId(userId: string, kind: string, i: number, j?: number) {
  return j == null ? `evt_${kind}_${userId}_${i}` : `evt_${kind}_${userId}_${i}_${j}`
}

// ---------- config knobs ----------
const MAIN_EVENTS_PER_USER = 120 // hundreds per user
const SUB_EVENTS_MIN = 10
const SUB_EVENTS_MAX = 20
const LOGIC_MAIN_MIN = 10
const LOGIC_MAIN_MAX = 20
const LOGIC_SUB_MIN = 2
const LOGIC_SUB_MAX = 5

const CATEGORIES = ['Career', 'Relationships', 'Health', 'Finances', 'Daily Life']
const PERCEPTIONS = ['Negative', 'Neutral', 'Positive', 'Mixed']

const EMOTIONS = [
  'Anxious',
  'Sad',
  'Angry',
  'Frustrated',
  'Disappointed',
  'Proud',
  'Relieved',
  'Calm',
  'Content',
  'Excited',
]

const PHYSICAL_SENSATIONS = [
  'Tight chest',
  'Sinking feeling in stomach',
  'Warm face',
  'Tension in shoulders',
  'Headache',
  'Butterflies in stomach',
  'Increased heart rate',
  'Heavy limbs',
  'Lightness in chest',
  'Restless legs',
]

const TAGS = [
  'work',
  'career',
  'job-search',
  'conflict',
  'family',
  'friends',
  'gym',
  'sleep',
  'money',
  'bills',
  'routine',
  'coping',
  'progress',
  'setback',
]

// ---------- per-user seeding using bulk inserts ----------
async function createUserWithEventsAndLogics(user: {
  id: string
  name: string | null
  email: string | null
}) {
  console.log(`Seeding data for user: ${user.email} (${MAIN_EVENTS_PER_USER} main events)`)

  const eventsData: Prisma.EventCreateManyInput[] = []
  const logicsData: Prisma.LogicCreateManyInput[] = []

  type MainMeta = {
    id: string
    title: string
    createdAt: Date
    category: string
  }

  const mainEventsMeta: MainMeta[] = []

  // ----- main events -----
  for (let i = 0; i < MAIN_EVENTS_PER_USER; i++) {
    const createdAt = randomDateWithinLastYear()
    const category = randomItem(CATEGORIES)
    const perception = randomItem(PERCEPTIONS)

    const title = (() => {
      switch (category) {
        case 'Career':
          return `Work event #${i + 1} - ${user.name || 'User'}`
        case 'Relationships':
          return `Relationship event #${i + 1}`
        case 'Health':
          return `Health event #${i + 1}`
        case 'Finances':
          return `Money event #${i + 1}`
        default:
          return `Daily life event #${i + 1}`
      }
    })()

    const description = `Auto-generated ${category.toLowerCase()} event for testing. Event index: ${
      i + 1
    } for user ${user.email}.`

    const id = makeEventId(user.id, 'main', i)

    mainEventsMeta.push({ id, title, createdAt, category })

    eventsData.push({
      id,
      title,
      description,
      intensity: randomInt(3, 9),
      importance: randomInt(3, 9),
      perception,
      emotions: randomSubset(EMOTIONS, 4),
      physicalSensations: randomSubset(PHYSICAL_SENSATIONS, 4),
      tags: randomSubset(TAGS, 4),
      images: [],
      category,
      verificationStatus: randomItem(['Pending', 'Verified']),
      userId: user.id,
      createdAt,
      // updatedAt is @updatedAt, let DB handle
    })
  }

  // ----- sub-events + logic -----
  for (let i = 0; i < mainEventsMeta.length; i++) {
    const main = mainEventsMeta[i]

    // Sub-events
    const subEventCount = randomInt(SUB_EVENTS_MIN, SUB_EVENTS_MAX)
    const subEventIds: string[] = []

    for (let j = 0; j < subEventCount; j++) {
      const subId = makeEventId(user.id, 'sub', i, j)
      subEventIds.push(subId)

      const subCreatedAt = new Date(main.createdAt)
      subCreatedAt.setHours(subCreatedAt.getHours() + randomInt(0, 12))

      eventsData.push({
        id: subId,
        title: `${main.title} – sub-event #${j + 1}`,
        description: `Sub-event #${j + 1} linked to "${main.title}" for testing parent/child relationships.`,
        intensity: randomInt(2, 9),
        importance: randomInt(2, 9),
        perception: randomItem(PERCEPTIONS),
        emotions: randomSubset(EMOTIONS, 3),
        physicalSensations: randomSubset(PHYSICAL_SENSATIONS, 3),
        tags: randomSubset(TAGS, 3),
        images: [],
        category: main.category,
        verificationStatus: randomItem(['Pending', 'Verified']),
        userId: user.id,
        parentEventId: main.id,
        createdAt: subCreatedAt,
      })
    }

    // Logic notes for main event
    const mainLogicCount = randomInt(LOGIC_MAIN_MIN, LOGIC_MAIN_MAX)
    for (let k = 0; k < mainLogicCount; k++) {
      const logicCreatedAt = new Date(main.createdAt)
      logicCreatedAt.setHours(logicCreatedAt.getHours() + randomInt(0, 24))

      logicsData.push({
        // id omitted -> DB will use default cuid()
        title: `Note #${k + 1} for ${main.title}`,
        description: `Auto-generated logic note #${k + 1} for main event "${main.title}".`,
        importance: randomInt(1, 10),
        status: randomItem(['Open', 'In Progress', 'Resolved']),
        facts: `Fact block for note #${k + 1} on event "${main.title}". Used for testing long-form text and summaries.`,
        assumptions: `Assumptions for note #${k + 1}. Example: "People will always react this way" or "I always fail at this".`,
        patterns: `Patterns identified in note #${k + 1}: all-or-nothing thinking, mind reading, catastrophizing, etc.`,
        actions: `Action plan for note #${k + 1}: small behavioral steps, reframing thoughts, tracking evidence.`,
        perception: randomItem(PERCEPTIONS),
        images: [],
        eventId: main.id,
        createdAt: logicCreatedAt,
      })
    }

    // Extra logic on a subset of sub-events
    const extraSubCount = randomInt(3, Math.min(7, subEventIds.length))
    for (let s = 0; s < extraSubCount; s++) {
      const subId = subEventIds[s]
      const subCreatedAt = new Date(main.createdAt)
      subCreatedAt.setHours(subCreatedAt.getHours() + randomInt(0, 18))

      const subLogicCount = randomInt(LOGIC_SUB_MIN, LOGIC_SUB_MAX)
      for (let n = 0; n < subLogicCount; n++) {
        const logicCreatedAt = new Date(subCreatedAt)
        logicCreatedAt.setHours(logicCreatedAt.getHours() + randomInt(0, 12))

        logicsData.push({
          title: `Sub-event note #${n + 1} for ${main.title} – sub ${s + 1}`,
          description: `Logic note for sub-event #${s + 1} of "${main.title}".`,
          importance: randomInt(1, 10),
          status: randomItem(['Open', 'In Progress', 'Resolved']),
          facts: `Facts about this sub-event for testing nested detail views.`,
          assumptions: `Assumptions noted for this sub-event.`,
          patterns: `Thinking or behavior patterns for this sub-event.`,
          actions: `Actions to take related to this specific sub-event.`,
          perception: randomItem(PERCEPTIONS),
          images: [],
          eventId: subId,
          createdAt: logicCreatedAt,
        })
      }
    }
  }

  console.log(
    `  Built ${eventsData.length} events and ${logicsData.length} logic notes in memory for ${user.email}`,
  )

  // Bulk insert events and logic
  await prisma.event.createMany({ data: eventsData })
  await prisma.logic.createMany({ data: logicsData })

  console.log(
    `  Inserted ${eventsData.length} events and ${logicsData.length} logic notes for ${user.email}`,
  )
}

// ---------- entrypoint ----------
async function main() {
  console.log('Clearing existing data…')

  // Delete in FK-safe order
  await prisma.logic.deleteMany()
  await prisma.event.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating test users…')

  const john = await prisma.user.create({
    data: {
      name: 'John McTester',
      email: 'john@example.com',
      image: 'https://i.pravatar.cc/150?u=john',
    },
  })

  const alex = await prisma.user.create({
    data: {
      name: 'Alex Debug',
      email: 'alex@example.com',
      image: 'https://i.pravatar.cc/150?u=alex',
    },
  })

  await createUserWithEventsAndLogics(john)
  await createUserWithEventsAndLogics(alex)

  console.log('Seed data created successfully ✅')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
