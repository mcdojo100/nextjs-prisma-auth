// src/app/events/EventsList.tsx
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import type { Event as PrismaEvent } from '@prisma/client'
import Link from 'next/link'
import { IconButton } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import EventForm from './EventForm'
import SortIcon from '@mui/icons-material/Sort'

type EventsListProps = {
  events: PrismaEvent[]
}

type DeleteTarget = {
  id: string
  title: string
}

export default function EventsList({ events }: EventsListProps) {
  const router = useRouter()

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const uniqueTags = useMemo(() => {
    const s = new Set<string>()
    for (const e of events) {
      const tags = (e as any).tags
      if (Array.isArray(tags)) tags.forEach((t) => s.add(t))
    }
    return Array.from(s).sort()
  }, [events])

  // menu state for options (edit/delete)
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuEvent, setMenuEvent] = useState<PrismaEvent | null>(null)

  // edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<PrismaEvent | null>(null)

  const openDeleteDialog = (event: PrismaEvent) => {
    setDeleteTarget({ id: event.id, title: event.title })
  }

  const openMenu = (e: any, event: PrismaEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuAnchorEl(e.currentTarget)
    setMenuEvent(event)
  }

  const openFilterMenu = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setFilterAnchorEl(e.currentTarget)
  }

  const closeFilterMenu = () => setFilterAnchorEl(null)

  const closeMenu = () => {
    setMenuAnchorEl(null)
    setMenuEvent(null)
  }

  const handleMenuEdit = () => {
    if (!menuEvent) return
    setEditEvent(menuEvent)
    setEditDialogOpen(true)
    closeMenu()
  }

  const handleMenuDelete = () => {
    if (!menuEvent) return
    openDeleteDialog(menuEvent)
    closeMenu()
  }

  const closeEditDialog = () => {
    setEditDialogOpen(false)
    setEditEvent(null)
  }

  const handleCloseDialog = () => {
    if (isDeleting) return
    setDeleteTarget(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsDeleting(true)

      const res = await fetch(`/api/events/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        alert('Failed to delete event')
        return
      }

      setDeleteTarget(null)
      router.refresh()
    } finally {
      setIsDeleting(false)
    }
  }

  // ensure events are sorted by createdAt according to sortOrder
  const sortedEvents = [...events].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return sortOrder === 'desc' ? tb - ta : ta - tb
  })

  const filteredEvents = selectedTags.length
    ? sortedEvents.filter((e) => (e as any).tags?.some((t: string) => selectedTags.includes(t)))
    : sortedEvents

  // Only show parent events (those without a parentEventId)
  const parentEvents = filteredEvents.filter(
    (e) => e.parentEventId === null || e.parentEventId === undefined,
  )

  // don't early-return here; always render the controls row below and
  // show a message when there are no parent events after filtering.

  return (
    <>
      {/* Sort / Filter controls (Filter on the left, then Sort) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 0 }}>
        <Button size="small" startIcon={<FilterListIcon />} onClick={openFilterMenu}>
          Filter
        </Button>

        <Button
          size="small"
          startIcon={<SortIcon />}
          onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
        >
          Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
        </Button>
      </Box>
      {/* Filter menu for selecting tags */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={closeFilterMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 1, minWidth: 240 } }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {uniqueTags.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No tags
            </Typography>
          ) : (
            uniqueTags.map((t) => {
              const sel = selectedTags.includes(t)
              return (
                <Chip
                  key={t}
                  label={t}
                  size="medium"
                  color={sel ? 'primary' : 'default'}
                  variant={sel ? 'filled' : 'outlined'}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                    )
                  }
                  sx={{ cursor: 'pointer' }}
                />
              )
            })
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, px: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={() => {
              setSelectedTags([])
              closeFilterMenu()
            }}
          >
            Clear filters
          </Button>
        </Box>
      </Menu>
      <Stack spacing={1.5}>
        {parentEvents.map((event) => (
          <Card
            key={event.id}
            sx={{
              width: '100%',
              position: 'relative',
              borderColor: 'divider',
            }}
          >
            <CardActionArea component="div" onClick={() => router.push(`/events/${event.id}`)}>
              <CardContent sx={{ pr: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    {/* Thumbnail if available */}
                    {(event as any).images && (event as any).images.length > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                          src={(event as any).images[0]}
                          alt="thumb"
                          style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        />
                        <Typography variant="subtitle1" noWrap>
                          {event.title}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="subtitle1" noWrap>
                        {event.title}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(event.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Options menu in upper right: Verification chip + Edit / Delete */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {event.verificationStatus && (
                      <Chip
                        label={event.verificationStatus}
                        size="small"
                        color={
                          event.verificationStatus === 'Verified True'
                            ? 'success'
                            : event.verificationStatus === 'Verified False'
                              ? 'warning'
                              : event.verificationStatus === 'Pending'
                                ? 'info'
                                : event.verificationStatus === 'True without Verification'
                                  ? 'info'
                                  : event.verificationStatus === 'Question Mark'
                                    ? 'warning'
                                    : 'default'
                        }
                      />
                    )}
                    <IconButton
                      aria-label={`options-event-${event.id}`}
                      size="small"
                      onClick={(e) => openMenu(e, event)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {event.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.5,
                    }}
                  >
                    {event.description}
                  </Typography>
                )}

                {/* Tags */}
                {(event as any).tags && (event as any).tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {(event as any).tags.slice(0, 3).map((t: string) => (
                      <Chip
                        key={t}
                        label={t}
                        size="small"
                        variant={selectedTags.includes(t) ? 'filled' : 'outlined'}
                        color={selectedTags.includes(t) ? 'primary' : 'default'}
                        sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedTags((prev) =>
                            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                          )
                        }}
                      />
                    ))}
                    {(event as any).tags.length > 3 && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`+${(event as any).tags.length - 3}`}
                      />
                    )}
                  </Box>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      {/* Options menu (single instance anchored to clicked item) */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleMenuEdit()
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleMenuDelete()
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Edit dialog using EventForm */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent dividers>
          {editEvent && (
            <EventForm
              event={editEvent}
              onSuccess={() => {
                closeEditDialog()
                router.refresh()
              }}
              onCancel={closeEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={handleCloseDialog}
        aria-labelledby="delete-event-dialog-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-event-dialog-title">Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `Are you sure you want to delete the event "${deleteTarget.title}"? This action cannot be undone.`
              : 'Are you sure you want to delete this event?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
