import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  try {
    const urls: string[] = []
    for (const file of files) {
      const { url } = await put(`uploads/${file.name}`, file, {
        access: 'public',
        addRandomSuffix: true,
      })
      urls.push(url)
    }
    return NextResponse.json({ urls })
  } catch (err) {
    console.error('Upload failed', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
