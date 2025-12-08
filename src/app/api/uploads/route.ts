import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of files) {
      if (!(file instanceof File)) continue
      const name = typeof file.name === 'string' ? file.name : 'file'
      const safe = name.replace(/[^a-z0-9.\-_]/gi, '_')
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`
      const buffer = Buffer.from(await file.arrayBuffer())
      const dest = path.join(uploadDir, unique)
      await fs.promises.writeFile(dest, buffer)
      urls.push(`/uploads/${unique}`)
    }

    return NextResponse.json({ urls })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: 'Upload failed', details: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}
