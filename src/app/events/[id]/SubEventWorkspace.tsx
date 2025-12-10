'use client'

import { useState, useEffect } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  DialogContentText,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SortIcon from '@mui/icons-material/Sort'
import EventForm from '../EventForm'
import type { Event as PrismaEvent } from '@prisma/client'
import TagFilter from '../TagFilter'

type Props = {
  eventId: string
  subEvents: PrismaEvent[]
}

export default function SubEventWorkspace({ eventId, subEvents }: Props) {
  const [openCreate, setOpenCreate] = useState(false)
  const [subSortOrder, setSubSortOrder] = useState<'desc' | 'asc'>('desc')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const router = useRouter()
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewEvent, setViewEvent] = useState<PrismaEvent | null>(null)

  const [menuState, setMenuState] = useState<{
    mouseX: number
    mouseY: number
    subEventId: string
  } | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setDeleteError(null)
  }, [])

  useEffect(() => {
    setDeleteError(null)
  }, [subSortOrder])

  useEffect(() => {
    if (!deleteDialogOpen) setDeleteError(null)
  }, [deleteDialogOpen])

  const openMenu = (e: ReactMouseEvent<HTMLElement>, evId: string) => {
    e.preventDefault()
    e.stopPropagation()

    setMenuState({ mouseX: e.clientX, mouseY: e.clientY, subEventId: evId })
  }

  const closeMenu = () => setMenuState(null)

  const handleMenuEdit = (subEventId: string) => {
    const ev = subEvents.find((s) => s.id === subEventId)
    if (!ev) return
    setViewEvent(ev)
    setViewDialogOpen(true)
  }

  const handleMenuDelete = (subEventId: string) => {
    setDeleteTargetId(subEventId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/events/${deleteTargetId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setDeleteDialogOpen(false)
      setDeleteTargetId(null)
      router.refresh()
    } catch (err) {
      console.error(err)
      let errorMsg = 'Failed to delete sub-event. Please try again.'
      if (err instanceof Error && err.message) {
        errorMsg += ` (${err.message})`
      }
      setDeleteError(errorMsg)
    } finally {
      setIsDeleting(false)
    }
  }
  const filteredSubEvents = selectedTags.length
    ? subEvents.filter((e) => (e as any).tags?.some((t: string) => selectedTags.includes(t)))
    : subEvents

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography variant="h6">Sub Events</Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <TagFilter events={subEvents} selectedTags={selectedTags} onChange={setSelectedTags} />
            <Button
              size="small"
              startIcon={<SortIcon />}
              onClick={() => setSubSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {subSortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Button>
          </Box>

          <Button
            variant="contained"
            size="small"
            sx={{ height: '30.75px', width: { xs: '100%', sm: 'auto' } }}
            onClick={() => setOpenCreate(true)}
          >
            + New Sub Event
          </Button>
        </Box>
      </Box>

      {deleteError && (
        <Box sx={{ mb: 1 }}>
          <Alert severity="error">{deleteError}</Alert>
        </Box>
      )}
      {filteredSubEvents.length === 0 ? (
        <Typography color="text.secondary">No sub events yet.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {[...filteredSubEvents]
            .sort((a, b) => {
              const ta = new Date(a.createdAt).getTime()
              const tb = new Date(b.createdAt).getTime()
              return subSortOrder === 'desc' ? tb - ta : ta - tb
            })
            .map((s) => {
              const perception = (s as any).perception ?? 'Neutral'
              const cardBorderColor =
                perception === 'Positive'
                  ? 'success.main'
                  : perception === 'Negative'
                    ? 'error.main'
                    : 'divider'

              return (
                <Card
                  key={s.id}
                  sx={{ width: '100%', position: 'relative', borderColor: cardBorderColor }}
                >
                  <CardActionArea
                    component="div"
                    onClick={() => {
                      setViewEvent(s)
                      setViewDialogOpen(true)
                    }}
                  >
                    <CardContent sx={{ pr: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="subtitle1" noWrap>
                          {s.title || 'Untitled'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={s.importance ? `Imp: ${s.importance}` : ''}
                            size="small"
                            color={
                              s.importance >= 8
                                ? 'error'
                                : s.importance >= 6
                                  ? 'warning'
                                  : s.importance >= 4
                                    ? 'info'
                                    : 'success'
                            }
                            sx={{ display: s.importance ? 'inline-flex' : 'none' }}
                          />
                          <IconButton
                            aria-label={`subevent-options-${s.id}`}
                            size="small"
                            onClick={(e) => openMenu(e, s.id)}
                            aria-controls={menuState ? 'subevent-options-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={
                              menuState && menuState.subEventId === s.id ? 'true' : undefined
                            }
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {new Date(s.createdAt).toLocaleString()}
                        </Typography>
                      </Box>

                      {s.description && (
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
                          {s.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              )
            })}
        </Stack>
      )}

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
        }}
      >
        <DialogTitle>New Sub Event</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
          <EventForm
            parentEventId={eventId}
            onSuccess={() => {
              setOpenCreate(false)
              router.refresh()
            }}
            onCancel={() => setOpenCreate(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button type="submit" form="event-form" variant="contained">
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        id="subevent-options-menu"
        open={Boolean(menuState)}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={menuState ? { top: menuState.mouseY, left: menuState.mouseX } : undefined}
        disablePortal
      >
        <MenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!menuState) return
            const subEventId = menuState.subEventId
            closeMenu()
            handleMenuEdit(subEventId)
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!menuState) return
            const subEventId = menuState.subEventId
            closeMenu()
            handleMenuDelete(subEventId)
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="delete-subevent-dialog"
      >
        <DialogTitle id="delete-subevent-dialog">Delete Sub Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Sub Event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
        }}
      >
        <DialogTitle>View Sub Event</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
          {viewEvent && (
            <EventForm
              event={viewEvent}
              onSuccess={() => {
                setViewDialogOpen(false)
                router.refresh()
              }}
              onCancel={() => setViewDialogOpen(false)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Cancel</Button>
          <Button type="submit" form="event-form" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
