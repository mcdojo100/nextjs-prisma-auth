import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload the file to Vercel Blob
      const blob = await put(`uploads/${file.name}`, buffer, {
        access: 'public',
        addRandomSuffix: true, // Optional: if you want a unique file name
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      urls.push(blob.url) // Save the URL for each uploaded file
    }

    return NextResponse.json({ urls })
  } catch (err: any) {
    console.error('Upload failed:', err)

    // Serialize error for better debugging
    const serializedError = {
      message: err?.message ?? String(err),
      stack: err?.stack,
    }

    return NextResponse.json(
      { error: 'Upload failed', fullError: serializedError },
      { status: 500 },
    )
  }
}
