import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const config = {
  runtime: 'nodejs',
}

export async function POST(request: Request) {
  console.log('hello from uploads route')
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const urls: string[] = []

    console.log('hello')
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      console.log('Blob token:', process.env.BLOB_READ_WRITE_TOKEN ? 'exists' : 'missing')

      const result = await put(`uploads/${file.name}`, buffer, {
        access: 'public',
        addRandomSuffix: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      urls.push(result.url)
    }

    return NextResponse.json({ urls })
  } catch (err: any) {
    console.error('Upload route failed', err)

    // Serialize the error for JSON
    const serializedError = {
      message: err.message ?? String(err),
      stack: err.stack,
      ...err, // optional: include other properties
    }

    return NextResponse.json(
      { error: 'Upload failed', fullError: serializedError },
      { status: 500 },
    )
  }
}
