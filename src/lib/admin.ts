import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // adjust if your authOptions path differs

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  const email = session?.user?.email?.toLowerCase() ?? null
  if (!email) return { ok: false as const, email: null }

  const allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!allowed.includes(email)) return { ok: false as const, email }

  return { ok: true as const, email }
}
