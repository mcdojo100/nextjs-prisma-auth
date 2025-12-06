'use client'

import { useState, useEffect } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Tabs,
  Tab,
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
  DialogActions,
  Alert,
  DialogContentText,
} from '@mui/material'
import { Dialog, DialogTitle, DialogContent } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EventForm from '../EventForm'
import LogicWorkspace from './LogicWorkspace'
import { Event, Logic } from '@prisma/client'

type EventTabsProps = {
  eventId: string
  logics: Logic[]
  subEvents: Event[]
}

export default function EventTabs({ eventId, logics, subEvents }: EventTabsProps) {
  const [tab, setTab] = useState(0)
  const [openCreate, setOpenCreate] = useState(false)
  const router = useRouter()
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewEvent, setViewEvent] = useState<Event | null>(null)

  // menu & delete state for Sub Event options (position-based)
  const [menuState, setMenuState] = useState<{
    mouseX: number
    mouseY: number
    subEventId: string
  } | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Clear stale delete errors on mount, when switching tabs, or when delete dialog closes
  useEffect(() => {
    setDeleteError(null)
  }, [])

  useEffect(() => {
    setDeleteError(null)
  }, [tab])

  useEffect(() => {
    if (!deleteDialogOpen) setDeleteError(null)
  }, [deleteDialogOpen])

  const openMenu = (e: ReactMouseEvent<HTMLElement>, evId: string) => {
    e.preventDefault()
    e.stopPropagation()

    setMenuState({
      mouseX: e.clientX,
      mouseY: e.clientY,
      subEventId: evId,
    })
  }

  const closeMenu = () => {
    setMenuState(null)
  }

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
      // Provide user-facing error feedback
      let errorMsg = 'Failed to delete sub-event. Please try again.'
      if (err instanceof Error && err.message) {
        errorMsg += ` (${err.message})`
      }
      setDeleteError(errorMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue)

  const a11yProps = (index: number) => ({
    id: `event-tab-${index}`,
    'aria-controls': `event-tabpanel-${index}`,
  })

  const TabPanel = ({
    children,
    value,
    index,
  }: {
    children?: React.ReactNode
    value: number
    index: number
  }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`event-tabpanel-${index}`}
        aria-labelledby={`event-tab-${index}`}
      >
        {value === index && <Box sx={{ py: 1 }}>{children}</Box>}
      </div>
    )
  }

  return (
    <Box>
      <Tabs value={tab} onChange={handleChange} aria-label="Event tabs" sx={{ mb: 2 }}>
        <Tab label="Sub Events" {...a11yProps(0)} />
        <Tab label="Logics" {...a11yProps(1)} />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Sub Events</Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ height: '30.75px' }}
              onClick={() => setOpenCreate(true)}
            >
              + New Sub Event
            </Button>
          </Box>

          {deleteError && (
            <Box sx={{ mb: 1 }}>
              <Alert severity="error">{deleteError}</Alert>
            </Box>
          )}

          {subEvents.length === 0 ? (
            <Typography color="text.secondary">No sub events yet.</Typography>
          ) : (
            <Stack spacing={1}>
              {subEvents.map((s) => (
                <Card
                  key={s.id}
                  sx={{
                    width: '100%',
                    position: 'relative',
                    borderColor: 'divider',
                  }}
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

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {s.description ?? 'No description provided.'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          )}

          {/* Create dialog */}
          <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
            <DialogTitle>New Sub Event</DialogTitle>
            <DialogContent dividers>
              <EventForm
                parentEventId={eventId}
                onSuccess={() => {
                  // close dialog, switch to Sub Events tab and refresh server data
                  setOpenCreate(false)
                  setTab(0)
                  router.refresh()
                }}
                onCancel={() => setOpenCreate(false)}
              />
            </DialogContent>
          </Dialog>

          {/* SUB EVENT MENU (position-anchored) */}
          <Menu
            id="subevent-options-menu"
            open={Boolean(menuState)}
            onClose={closeMenu}
            anchorReference="anchorPosition"
            anchorPosition={
              menuState ? { top: menuState.mouseY, left: menuState.mouseX } : undefined
            }
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
              <Button
                onClick={confirmDelete}
                color="error"
                variant="contained"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>View Sub Event</DialogTitle>
            <DialogContent dividers>
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
          </Dialog>
        </Box>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <LogicWorkspace eventId={eventId} logics={logics} />
      </TabPanel>
    </Box>
  )
}
