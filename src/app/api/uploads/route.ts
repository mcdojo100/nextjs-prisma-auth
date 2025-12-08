import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const formData = await request.formData()
  const files = formData.getAll('files') as File[] // multiple files

  if (!files || !files.length) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  try {
    // Upload each file to Vercel Blob
    const urls: string[] = []
    for (const file of files) {
      const { url } = await put(`uploads/${file.name}`, file, {
        access: 'public',
      })
      urls.push(url)
    }

    return NextResponse.json({ urls })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
