import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const config = {
  runtime: 'nodejs',
}

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

      try {
        const result = await put(`uploads/${file.name}`, buffer, {
          access: 'public',
          addRandomSuffix: true,
        })
        console.log('Vercel Blob result:', result) // full response
        urls.push(result.url)
      } catch (uploadErr: any) {
        console.error('Individual file upload failed:', file.name, uploadErr)

        // If the error has a response property, print it
        if (uploadErr.response) {
          console.error('Vercel Blob response:', uploadErr.response)
        }

        return NextResponse.json(
          {
            error: `Failed to upload file: ${file.name}`,
            details: uploadErr?.message ?? String(uploadErr),
            fullError: uploadErr,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ urls })
  } catch (err: any) {
    console.error('Upload route failed', err)

    let message = 'Upload failed'
    if (err instanceof Error) message = err.message
    else if (typeof err === 'object') message = JSON.stringify(err)

    return NextResponse.json(
      { error: message, stack: err?.stack ?? null, fullError: err },
      { status: 500 },
    )
  }
}
