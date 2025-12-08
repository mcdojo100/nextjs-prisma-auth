'use client'

import {
  Box,
  Button,
  Slider,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Event as PrismaEvent } from '@prisma/client'

type EventFormProps = {
  event?: PrismaEvent | null
  onSuccess?: () => void
  onCancel?: () => void
  parentEventId?: string | null
}

export default function EventForm({
  event: initialEvent,
  onSuccess,
  onCancel,
  parentEventId,
}: EventFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [intensity, setIntensity] = useState<number>(5)
  const [importance, setImportance] = useState<number>(5)
  const [physicalSensations, setPhysicalSensations] = useState<string[]>([])
  const [emotions, setEmotions] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>((initialEvent as any)?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<string[]>((initialEvent as any)?.images ?? [])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [verificationStatus, setVerificationStatus] = useState<string>('Pending')
  const [category, setCategory] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title)
      setDescription(initialEvent.description)
      setIntensity(initialEvent.intensity)
      setImportance(initialEvent.importance)
      setEmotions(initialEvent.emotions ?? [])
      setPhysicalSensations(initialEvent.physicalSensations ?? [])

      const statuses = [
        'Verified True',
        'Verified False',
        'Pending',
        'True without Verification',
        'Question Mark',
        'Closed - Past/Unverified',
      ]

      const normalize = (s?: string) =>
        (s ?? '')
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')

      const mapStatus = (s?: string) => {
        const ns = normalize(s)
        if (!ns) return 'Pending'
        const found = statuses.find((opt) => {
          const no = normalize(opt)
          return no === ns || no.startsWith(ns) || ns.startsWith(no)
        })
        return found ?? 'Pending'
      }

      setVerificationStatus(mapStatus(initialEvent.verificationStatus))
      setCategory(initialEvent.category ?? '')
      setTags((initialEvent as any).tags ?? [])
      setImages((initialEvent as any).images ?? [])
    } else {
      setTitle('')
      setDescription('')
      setIntensity(5)
      setImportance(5)
      setEmotions([])
      setPhysicalSensations([])
      setVerificationStatus('Pending')
      setCategory('')
      setTags([])
      setImages([])
    }
  }, [initialEvent])

  const normalizeAndDedupe = (arr: any[]) =>
    Array.from(new Set(arr.map((t: any) => String(t).toLowerCase()).filter(Boolean)))

  const addTagsFromInput = (raw: string) => {
    if (!raw) return
    const parts = raw.includes(',') ? raw.split(',') : [raw]
    const toAdd = parts.map((p) => String(p).toLowerCase()).filter(Boolean)
    if (!toAdd.length) return
    setTags((prev) => normalizeAndDedupe([...prev, ...toAdd]))
    setTagInput('')
  }

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  /**
   * Upload to Vercel Blob
   */
  async function uploadToVercelBlob(files: File[]): Promise<string[]> {
    const form = new FormData()
    files.forEach((f) => form.append('file', f))

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    })

    if (!res.ok) throw new Error('Image upload failed.')

    const data = await res.json()
    return data.urls ?? []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // If there are selected files, upload them first
      let uploadedUrls: string[] = []
      if (selectedFiles.length > 0) {
        const form = new FormData()
        selectedFiles.forEach((f) => form.append('files', f)) // note: 'files' matches API

        const upl = await fetch('/api/uploads', { method: 'POST', body: form })
        if (!upl.ok) throw new Error('Failed to upload images')

        const du = await upl.json()
        uploadedUrls = Array.isArray(du.urls) ? du.urls : []
      }

      const imagesToSend = Array.from(new Set([...(images ?? []), ...uploadedUrls]))

      let res: Response

      if (initialEvent?.id) {
        // update existing
        res = await fetch(`/api/events/${initialEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            intensity,
            importance,
            emotions,
            category,
            physicalSensations,
            verificationStatus,
            tags,
            images: imagesToSend,
          }),
        })
      } else {
        // create new
        res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            intensity,
            importance,
            emotions,
            category,
            physicalSensations,
            verificationStatus,
            tags,
            images: imagesToSend,
            parentEventId,
          }),
        })
      }

      if (!res.ok) throw new Error('Failed to save event')

      if (!initialEvent) {
        if (!parentEventId) {
          router.push('/events')
        }
      } else {
        router.refresh()
      }

      onSuccess?.()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/events')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          autoFocus
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <span>Intensity</span>
            <span>{intensity}</span>
          </Box>
          <Slider
            value={intensity}
            onChange={(_, v) => setIntensity(v as number)}
            min={1}
            max={10}
            step={1}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <span>Importance</span>
            <span>{importance}</span>
          </Box>
          <Slider
            value={importance}
            onChange={(_, v) => setImportance(v as number)}
            min={1}
            max={10}
            step={1}
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel id="verification-status-label">Verification Status</InputLabel>
          <Select
            labelId="verification-status-label"
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value as string)}
            label="Verification Status"
          >
            {[
              'Verified True',
              'Verified False',
              'Pending',
              'True without Verification',
              'Question Mark',
              'Closed - Past/Unverified',
            ].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="emotions-label">Emotions</InputLabel>
          <Select
            labelId="emotions-label"
            multiple
            value={emotions}
            onChange={(e) =>
              setEmotions(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : (e.target.value as string[]),
              )
            }
            renderValue={(sel) => sel.join(', ')}
            label="Emotions"
          >
            {['anger', 'sadness', 'anxiety', 'numbness', 'confusion', 'shame', 'hope', 'calm'].map(
              (emo) => (
                <MenuItem key={emo} value={emo}>
                  <Checkbox checked={emotions.includes(emo)} />
                  <ListItemText primary={emo} />
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="physical-sensations-label">Physical Sensations</InputLabel>
          <Select
            labelId="physical-sensations-label"
            multiple
            value={physicalSensations}
            onChange={(e) =>
              setPhysicalSensations(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : (e.target.value as string[]),
              )
            }
            renderValue={(sel) => sel.join(', ')}
            label="Physical Sensations"
          >
            {[
              'Tight Chest',
              'Butterflies/Stomach Flutters',
              'Headache/Pressure',
              'Warmth or Heat in the Body',
              'Shaky or Trembling',
              'Tension in Shoulders/Neck',
              'Shortness of Breath',
              'Fatigue/Heavy Limbs',
            ].map((s) => (
              <MenuItem key={s} value={s}>
                <Checkbox checked={physicalSensations.includes(s)} />
                <ListItemText primary={s} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            onChange={(e) => setCategory(e.target.value as string)}
            label="Category"
          >
            {['work', 'relationship', 'self', 'family', 'health'].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tags */}
        <Box>
          <TextField
            label="Add tag"
            value={tagInput}
            placeholder="type and press Enter"
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTagsFromInput(tagInput)
              }
            }}
            fullWidth
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            {tags.map((t) => (
              <Chip key={t} label={t} onDelete={() => removeTag(t)} size="small" />
            ))}
          </Box>
        </Box>

        {/* Images */}
        <Box>
          <Button variant="contained" component="label">
            Upload Images
            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setSelectedFiles(files)
                const prevs = files.map((f) => URL.createObjectURL(f))
                setPreviews(prevs)
              }}
            />
          </Button>

          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {images.map((src) => (
              <Box key={src}>
                <img
                  src={src}
                  style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 4 }}
                />
                <Button
                  size="small"
                  onClick={() => setImages((prev) => prev.filter((p) => p !== src))}
                >
                  Remove
                </Button>
              </Box>
            ))}

            {previews.map((p, idx) => (
              <Box key={p}>
                <img
                  src={p}
                  style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 4 }}
                />
                <Button
                  size="small"
                  onClick={() => {
                    setPreviews((ps) => ps.filter((x) => x !== p))
                    setSelectedFiles((sf) => sf.filter((_, i) => i !== idx))
                  }}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        </Box>

        {error && <Box sx={{ color: 'error.main' }}>{error}</Box>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialEvent ? 'Save Changes' : 'Create Event'}
          </Button>
        </Box>
      </Stack>
    </form>
  )
}
