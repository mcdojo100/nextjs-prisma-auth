'use client'

import { useState, useEffect, FormEvent } from 'react'
import {
  Box,
  TextField,
  Typography,
  Slider,
  Button,
  Stack,
  Alert,
  MenuItem, // ⬅️ NEW
} from '@mui/material'
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
}

export default function LogicForm({
  eventId,
  logicId,
  initialData,
  mode = 'create',
  onSuccess,
  onCancel,
}: LogicFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')

  const [importance, setImportance] = useState(initialData?.importance ?? 5)
  const [status, setStatus] = useState(
    initialData?.status ?? 'Open', // ⬅️ default to "Open"
  )
  const [perception, setPerception] = useState<string | undefined>(
    initialData?.perception ?? 'Neutral',
  )
  const [facts, setFacts] = useState(initialData?.facts ?? '')
  const [assumptions, setAssumptions] = useState(initialData?.assumptions ?? '')
  const [patterns, setPatterns] = useState(initialData?.patterns ?? '')
  const [actions, setActions] = useState(initialData?.actions ?? '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title ?? '')
      setDescription(initialData.description ?? '')
      setImportance(initialData.importance)
      setStatus(initialData.status || 'Open')
      setPerception(initialData.perception ?? 'Neutral')
      setFacts(initialData.facts)
      setAssumptions(initialData.assumptions)
      setPatterns(initialData.patterns)
      setActions(initialData.actions)
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
    setError(null)
    setIsSubmitting(true)

    try {
      const endpoint = mode === 'create' ? `/api/events/${eventId}/logic` : `/api/logic/${logicId}`

      if (mode === 'edit' && !logicId) {
        throw new Error('Missing logicId for edit mode')
      }

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
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save note')
      }

      router.refresh()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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

        {/* Status and Importance on same row (responsive) */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Left: Status */}
          <Box sx={{ width: { xs: '100%', sm: '40%' } }}>
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
            <TextField
              select
              label="Perception"
              value={perception}
              onChange={(e) => setPerception(e.target.value)}
              fullWidth
              sx={{ mt: 1 }}
            >
              <MenuItem value="Positive">Positive</MenuItem>
              <MenuItem value="Neutral">Neutral</MenuItem>
              <MenuItem value="Negative">Negative</MenuItem>
            </TextField>
          </Box>

          {/* Right: Importance (slider) */}
          <Box sx={{ width: { xs: '100%', sm: '60%' } }}>
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
          {onCancel && (
            <Button onClick={onCancel} disabled={isSubmitting}>
              Close
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {mode === 'create' ? 'Add Note' : 'Save Changes'}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
