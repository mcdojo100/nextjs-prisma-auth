import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const formData = await request.formData()
  const files = formData.getAll('file') as File[]   // accepts multiple "file" entries

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  const uploadedUrls: string[] = []

  for (const file of files) {
    // Make filename unique so uploads never overwrite previous ones
    const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
    const uniqueName = `uploads/${randomUUID()}.${ext}`

    const { url } = await put(uniqueName, file, {
      access: 'public',
    })

    uploadedUrls.push(url)
  }

  return NextResponse.json({ urls: uploadedUrls })
}
