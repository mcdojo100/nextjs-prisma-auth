'use client'

import {
  Box,
  Tabs,
  Tab,
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material'
import Close from '@mui/icons-material/Close'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Event as PrismaEvent } from '@prisma/client'

// ✅ Date/Time pickers
import dayjs, { Dayjs } from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'

type EventFormProps = {
  event?: PrismaEvent | null
  onSuccess?: () => void
  onCancel?: () => void
  parentEventId?: string | null
  formId?: string
  initialOccurredAt?: Date | null
}

export default function EventForm({
  event: initialEvent,
  onSuccess,
  onCancel,
  parentEventId,
  formId = 'event-form',
  initialOccurredAt = null,
}: EventFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [intensity, setIntensity] = useState<number>(5)
  const [importance, setImportance] = useState<number>(5)
  const [perception, setPerception] = useState<string>('Neutral')
  const [physicalSensations, setPhysicalSensations] = useState<string[]>([])
  const [emotions, setEmotions] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>((initialEvent as any)?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<string[]>((initialEvent as any)?.images ?? [])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>('Pending')
  const [tab, setTab] = useState<number>(0)
  const [category, setCategory] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Occurred At (date + optional time)
  const [occurredDate, setOccurredDate] = useState<Dayjs | null>(dayjs())
  const [occurredTime, setOccurredTime] = useState<Dayjs | null>(dayjs())

  const router = useRouter()

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title ?? '')
      setDescription(initialEvent.description ?? '')

      // ✅ IMPORTANT: never set Slider state to undefined/null
      setIntensity((initialEvent as any).intensity ?? 5)
      setImportance((initialEvent as any).importance ?? 5)

      setEmotions((initialEvent as any).emotions ?? [])
      setPhysicalSensations((initialEvent as any).physicalSensations ?? [])

      // ✅ load occurredAt if present, fallback to createdAt
      const occurred = (initialEvent as any).occurredAt
        ? dayjs((initialEvent as any).occurredAt)
        : dayjs((initialEvent as any).createdAt)

      setOccurredDate(occurred)
      setOccurredTime(occurred)

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

      setVerificationStatus(mapStatus((initialEvent as any).verificationStatus))
      setCategory((initialEvent as any).category ?? '')
      setTags((initialEvent as any).tags ?? [])
      setImages((initialEvent as any).images ?? [])
      setPerception((initialEvent as any).perception ?? 'Neutral')
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
      setPerception('Neutral')

      // ✅ default occurredAt to now for new events
      const base = initialOccurredAt ? dayjs(initialOccurredAt) : dayjs()
      setOccurredDate(base)
      setOccurredTime(base)
    }
  }, [initialEvent, initialOccurredAt])

  // Combine date + time into a single Date for Prisma
  const occurredAt: Date = useMemo(() => {
    const d = occurredDate ?? dayjs()
    const t = occurredTime

    if (!t) {
      // If user clears time, pin to midday to avoid timezone edge cases
      return d.hour(12).minute(0).second(0).millisecond(0).toDate()
    }

    return d.hour(t.hour()).minute(t.minute()).second(0).millisecond(0).toDate()
  }, [occurredDate, occurredTime])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // upload selected files first
      let uploadedUrls: string[] = []
      if (selectedFiles.length > 0) {
        const form = new FormData()
        selectedFiles.forEach((f) => form.append('files', f))

        const upl = await fetch('/api/uploads', { method: 'POST', body: form })
        if (!upl.ok) throw new Error('Failed to upload images')

        const du = await upl.json()
        uploadedUrls = Array.isArray(du.urls) ? du.urls : []
      }

      const imagesToSend = Array.from(new Set([...(images ?? []), ...uploadedUrls]))

      const payload = {
        title,
        description,
        intensity,
        importance,
        perception,
        emotions,
        category,
        physicalSensations,
        verificationStatus,
        tags,
        images: imagesToSend,
        occurredAt: occurredAt.toISOString(),
      }

      let res: Response
      if ((initialEvent as any)?.id) {
        res = await fetch(`/api/events/${(initialEvent as any).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            parentEventId,
          }),
        })
      }

      if (!res.ok) throw new Error('Failed to save event')

      if (!initialEvent) {
        if (!parentEventId) router.push('/events')
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
    if (onCancel) onCancel()
    else {
      router.push('/events')
      router.refresh()
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form id={formId} onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Event form tabs">
            <Tab label="Details" />
            <Tab label="Images" />
          </Tabs>

          {tab === 0 && (
            <>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                autoFocus
              />

              {/* ✅ Occurred At (date + time) */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DatePicker
                  label="Date"
                  value={occurredDate}
                  onChange={(v) => setOccurredDate(v)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <TimePicker
                  label="Time"
                  value={occurredTime}
                  onChange={(v) => setOccurredTime(v)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Optional (clear for all-day)',
                    },
                  }}
                />
              </Stack>

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
                <InputLabel id="perception-label">Perception</InputLabel>
                <Select
                  labelId="perception-label"
                  value={perception}
                  onChange={(e) => setPerception(e.target.value as string)}
                  label="Perception"
                >
                  {['Positive', 'Neutral', 'Negative'].map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
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
                  {[
                    'anger',
                    'sadness',
                    'anxiety',
                    'numbness',
                    'confusion',
                    'shame',
                    'hope',
                    'calm',
                  ].map((emo) => (
                    <MenuItem key={emo} value={emo}>
                      <Checkbox checked={emotions.includes(emo)} />
                      <ListItemText primary={emo} />
                    </MenuItem>
                  ))}
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
            </>
          )}

          {tab === 1 && (
            <>
              {/* Images */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    color="primary"
                    component="label"
                    aria-label="upload images"
                    sx={{ width: 40, height: 40 }}
                  >
                    <Add />
                    <input
                      hidden
                      multiple
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? [])
                        setSelectedFiles((prev) => [...prev, ...files])

                        const newPreviews = files.map((f) => URL.createObjectURL(f))
                        setPreviews((prev) => [...prev, ...newPreviews])
                      }}
                    />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {images.map((src) => (
                    <Box key={src} sx={{ position: 'relative' }}>
                      <IconButton
                        size="small"
                        onClick={() => setImages((prev) => prev.filter((p) => p !== src))}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.45)',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                          zIndex: 2,
                        }}
                        aria-label="remove image"
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <img
                        src={src}
                        alt="uploaded"
                        style={{
                          width: 96,
                          height: 64,
                          objectFit: 'cover',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setPreviewSrc(src)
                          setPreviewOpen(true)
                        }}
                      />
                    </Box>
                  ))}

                  {previews.map((p, idx) => (
                    <Box key={p} sx={{ position: 'relative' }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setPreviews((ps) => ps.filter((x) => x !== p))
                          setSelectedFiles((sf) => sf.filter((_, i) => i !== idx))
                        }}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.45)',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                          zIndex: 2,
                        }}
                        aria-label="remove preview"
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <img
                        src={p}
                        alt={`preview-${idx}`}
                        style={{
                          width: 96,
                          height: 64,
                          objectFit: 'cover',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setPreviewSrc(p)
                          setPreviewOpen(true)
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* Image preview dialog */}
          <Dialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
            }}
          >
            <DialogTitle>
              Image Preview
              <IconButton
                aria-label="close"
                onClick={() => setPreviewOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent
              dividers
              sx={{
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {previewSrc && (
                <img
                  src={previewSrc}
                  alt="preview-large"
                  style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                />
              )}
            </DialogContent>
          </Dialog>

          {error && <Box sx={{ color: 'error.main' }}>{error}</Box>}
        </Stack>
      </form>
    </LocalizationProvider>
  )
}
