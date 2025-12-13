'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { Box, TextField, Typography, Slider, Button, Stack, Alert, MenuItem } from '@mui/material'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = ['Open', 'Needs Watch', 'Resolved'] as const

type LogicFormProps = {
  eventId: string
  logicId?: string
  initialData?: {
    title?: string
    description?: string
    perception?: string
    importance: number
    status: string
    facts: string
    assumptions: string
    patterns: string
    actions: string
  }
  mode?: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
  formId?: string
  hideActions?: boolean
  selectedFiles?: File[]
  setSelectedFiles?: (files: File[]) => void
  images?: string[]
  setImages?: (imgs: string[]) => void
}

export default function LogicForm({
  eventId,
  logicId,
  initialData,
  mode = 'create',
  onSuccess,
  onCancel,
  formId = 'logic-form',
  hideActions = false,
  selectedFiles = [],
  setSelectedFiles,
  images = [],
  setImages,
}: LogicFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')

  const [importance, setImportance] = useState(initialData?.importance ?? 5)
  const [status, setStatus] = useState(initialData?.status ?? 'Open')
  const [perception, setPerception] = useState<string | undefined>(
    initialData?.perception ?? 'Neutral',
  )
  const [facts, setFacts] = useState(initialData?.facts ?? '')
  const [assumptions, setAssumptions] = useState(initialData?.assumptions ?? '')
  const [patterns, setPatterns] = useState(initialData?.patterns ?? '')
  const [actions, setActions] = useState(initialData?.actions ?? '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title ?? '')
      setDescription(initialData.description ?? '')
      setImportance(initialData.importance ?? 5)
      setStatus(initialData.status || 'Open')
      setPerception(initialData.perception ?? 'Neutral')
      setFacts(initialData.facts ?? '')
      setAssumptions(initialData.assumptions ?? '')
      setPatterns(initialData.patterns ?? '')
      setActions(initialData.actions ?? '')
    }

    if (mode === 'create' && !initialData) {
      setTitle('')
      setDescription('')
      setImportance(5)
      setStatus('Open')
      setPerception('Neutral')
      setFacts('')
      setAssumptions('')
      setPatterns('')
      setActions('')
    }
  }, [initialData, mode])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // ✅ Hard guard against double submit (double click/tap, slow mobile, etc.)
    if (submittingRef.current) return
    submittingRef.current = true

    setError(null)
    setIsSubmitting(true)

    try {
      if (mode === 'edit' && !logicId) {
        throw new Error('Missing logicId for edit mode')
      }

      const endpoint = mode === 'create' ? `/api/events/${eventId}/logic` : `/api/logic/${logicId}`

      // Upload selected files first (if any)
      let uploadedUrls: string[] = []
      if (selectedFiles && selectedFiles.length > 0) {
        const form = new FormData()
        for (const file of selectedFiles) {
          form.append('files', file)
        }

        const upl = await fetch('/api/uploads', { method: 'POST', body: form })
        if (!upl.ok) {
          throw new Error('Image upload failed')
        }

        const uplData = await upl.json().catch(() => ({}))
        uploadedUrls = Array.isArray(uplData?.urls) ? uplData.urls : []
      }

      // Dedupe merged images so multiple submits can’t re-add the same urls
      const mergedImages = Array.from(new Set([...(images ?? []), ...uploadedUrls]))

      const res = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          perception,
          importance,
          status,
          facts,
          assumptions,
          patterns,
          actions,
          images: mergedImages,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save note')
      }

      router.refresh()
      onSuccess?.()

      // Clear selected files after successful save
      try {
        setSelectedFiles?.([])
      } catch {
        /* ignore */
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
      submittingRef.current = false
    }
  }

  return (
    <Box id={formId} component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {/* ✅ Disables all inputs/buttons while submitting */}
      <fieldset
        disabled={isSubmitting}
        style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}
      >
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <Box>
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ mt: 1 }}>
            <TextField
              select
              label="Perception"
              value={perception}
              onChange={(e) => setPerception(e.target.value)}
              fullWidth
            >
              <MenuItem value="Positive">Positive</MenuItem>
              <MenuItem value="Neutral">Neutral</MenuItem>
              <MenuItem value="Negative">Negative</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Importance (1–10)</Typography>
            <Slider
              aria-label="importance-slider"
              value={importance}
              onChange={(_, value) => {
                if (typeof value === 'number') setImportance(value)
              }}
              step={1}
              min={1}
              max={10}
              valueLabelDisplay="auto"
            />
          </Box>

          <TextField
            label="Facts"
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <TextField
            label="Assumptions"
            value={assumptions}
            onChange={(e) => setAssumptions(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <TextField
            label="Patterns"
            value={patterns}
            onChange={(e) => setPatterns(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <TextField
            label="Actions"
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          {!hideActions && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              {onCancel && <Button onClick={onCancel}>Close</Button>}

              <Button type="submit" variant="contained">
                {mode === 'create' ? 'Add Note' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Stack>
      </fieldset>
    </Box>
  )
}
