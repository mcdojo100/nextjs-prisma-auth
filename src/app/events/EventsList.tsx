// src/app/events/EventsList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
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
  Divider,
  Menu,
  MenuItem,
} from '@mui/material'
import type { Event as PrismaEvent } from '@prisma/client'
import Link from 'next/link'
import { IconButton } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
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

  // Only show parent events (those without a parentEventId)
  const parentEvents = sortedEvents.filter((e) => !e.parentEventId)

  if (!parentEvents.length) {
    return (
      <Box sx={{ mt: 2 }}>
        {events.length > 0 ? (
          <Typography variant="body1">
            No parent events to display. Sub-events are shown under their parent events.
          </Typography>
        ) : (
          <Typography variant="body1">
            You don&apos;t have any events yet. Click &quot;Create Event&quot; to add your first
            one.
          </Typography>
        )}
      </Box>
    )
  }

  return (
    <>
      {/* Sort control */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          size="small"
          startIcon={<SortIcon />}
          onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
        >
          Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
        </Button>
      </Box>
      <Stack spacing={2}>
        {parentEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ pb: 2.5 }}>
                {/* Top row: title + category + menu */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {event.title}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(event.createdAt).toLocaleString()}
                      </Typography>
                      {event.verificationStatus && (
                        <Box>
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
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Options menu in upper right: Edit / Delete */}
                  <IconButton
                    aria-label={`options-event-${event.id}`}
                    size="small"
                    onClick={(e) => openMenu(e, event)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Description */}
                {event.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {event.description}
                  </Typography>
                )}

                {/* Divider + intensity / importance row */}
                <Divider sx={{ mb: 1.5 }} />

                {/* CHIP SECTIONS */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {/* Category */}
                  {event.category && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      <Chip
                        label={event.category[0].toUpperCase() + event.category.slice(1)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  )}

                  {/* Intensity & Importance */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={`Intensity: ${event.intensity}/10`} size="small" />
                    <Chip label={`Importance: ${event.importance}/10`} size="small" />
                  </Box>

                  {/* Emotions */}
                  {(event.emotions?.length ?? 0) > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {event.emotions.map((emo) => (
                        <Chip
                          key={emo}
                          label={emo}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Physical sensations */}
                  {(event.physicalSensations?.length ?? 0) > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {event.physicalSensations.map((ps) => (
                        <Chip key={ps} label={ps} size="small" />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Link>
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
