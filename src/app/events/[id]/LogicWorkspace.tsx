// src/app/events/[id]/LogicWorkspace.tsx
'use client'

import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  DialogContentText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useRouter } from 'next/navigation'
import SortIcon from '@mui/icons-material/Sort'
import type { Logic as PrismaLogic } from '@prisma/client'
import LogicForm from '../LogicForm'

// Extend the Prisma type so TS knows about the new fields
type LogicWithTitleDesc = PrismaLogic & {
  title: string
  description: string
}

type LogicWorkspaceProps = {
  eventId: string
  logics: LogicWithTitleDesc[]
}

export default function LogicWorkspace({ eventId, logics }: LogicWorkspaceProps) {
  // Start with no selected logic so cards are only highlighted on hover
  // editingLogicId tracks which logic is being edited for the dialog; it does not affect list styling
  const [editingLogicId, setEditingLogicId] = useState<string | null>(null)
  const [mode, setMode] = useState<'view-edit' | 'create'>(
    logics.length > 0 ? 'view-edit' : 'create',
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [hasMounted, setHasMounted] = useState(false) // to avoid hydration issues with dates

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const selectedLogic = useMemo(
    () => logics.find((l) => l.id === editingLogicId) || null,
    [logics, editingLogicId],
  )

  // Decide if the form is in create or edit mode
  const formMode: 'create' | 'edit' = mode === 'view-edit' && selectedLogic ? 'edit' : 'create'

  const formInitialData =
    formMode === 'edit' && selectedLogic
      ? {
          title: selectedLogic.title,
          description: selectedLogic.description,
          importance: selectedLogic.importance,
          status: selectedLogic.status,
          facts: selectedLogic.facts,
          assumptions: selectedLogic.assumptions,
          patterns: selectedLogic.patterns,
          actions: selectedLogic.actions,
        }
      : undefined

  const formLogicId = formMode === 'edit' && selectedLogic ? selectedLogic.id : undefined

  const handleOpenCreate = () => {
    setMode('create')
    setEditingLogicId(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (logicId: string) => {
    setMode('view-edit')
    setEditingLogicId(logicId)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  // sorted logics according to sortOrder
  const sortedLogics = [...logics].sort((a, b) => {
    const ta = new Date(a.createdAt as any).getTime()
    const tb = new Date(b.createdAt as any).getTime()
    return sortOrder === 'desc' ? tb - ta : ta - tb
  })

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Menu state for per-logic options (Edit / Delete)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [menuLogicId, setMenuLogicId] = useState<string | null>(null)

  const openMenu = (e: MouseEvent<HTMLElement>, logicId: string) => {
    e.stopPropagation()
    setMenuAnchorEl(e.currentTarget as HTMLElement)
    setMenuLogicId(logicId)
  }

  const closeMenu = () => {
    setMenuAnchorEl(null)
    setMenuLogicId(null)
  }

  const openDeleteDialog = (logicId: string) => {
    setDeleteTargetId(logicId)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeleteTargetId(null)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/logic/${deleteTargetId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error('Failed to delete')
      }
      closeDeleteDialog()
      router.refresh()
    } catch (err) {
      console.error('Delete failed', err)
      closeDeleteDialog()
    } finally {
      setIsDeleting(false)
    }
  }

  // safe date formatter that only runs after mount
  const formatCreatedAt = (createdAt: Date | string) => {
    if (!hasMounted) return '' // render empty on first SSR + hydration
    const d = createdAt instanceof Date ? createdAt : new Date(createdAt)
    return d.toLocaleString() // now it's purely client-side
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Logic</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            startIcon={<SortIcon />}
            onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
          >
            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </Button>
          <Button variant="contained" size="small" onClick={handleOpenCreate}>
            + New Logic
          </Button>
        </Box>
      </Box>

      {/* Logic cards list – full width of container */}
      {logics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No Logic items yet. Click &quot;New Logic&quot; to add your first one.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {sortedLogics.map((logic) => (
            <Card
              key={logic.id}
              sx={{
                width: '100%',
                position: 'relative',
                borderColor: 'divider',
              }}
            >
              {/* ⬅️ FIX: make CardActionArea a <div>, not a <button> */}
              <CardActionArea component="div" onClick={() => handleOpenEdit(logic.id)}>
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
                      {logic.title || 'Untitled logic'}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`Imp: ${logic.importance}`}
                          size="small"
                          color={
                            logic.importance >= 8
                              ? 'error'
                              : logic.importance >= 6
                                ? 'warning'
                                : logic.importance >= 4
                                  ? 'info'
                                  : 'success'
                          }
                        />
                        <IconButton
                          aria-label={`logic-options-${logic.id}`}
                          size="small"
                          onClick={(e) => openMenu(e, logic.id)}
                          aria-controls={menuAnchorEl ? 'logic-options-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={
                            menuAnchorEl && menuLogicId === logic.id ? 'true' : undefined
                          }
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {formatCreatedAt(logic.createdAt as any)}
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
                    {logic.description ?? 'No description provided.'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog with LogicForm */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{formMode === 'create' ? 'New Logic' : 'Edit Logic'}</DialogTitle>
        <DialogContent dividers>
          <LogicForm
            eventId={eventId}
            mode={formMode}
            logicId={formLogicId}
            initialData={formInitialData}
            onSuccess={() => {
              if (formMode === 'create') {
                setMode('create')
              }
              setDialogOpen(false)
              router.refresh()
            }}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Options menu for Edit/Delete (single shared menu) */}
      <Menu
        id="logic-options-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          closeMenu()
        }}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const id = menuLogicId
            closeMenu()
            if (id) handleOpenEdit(id)
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const id = menuLogicId
            closeMenu()
            if (id) openDeleteDialog(id)
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-logic-dialog-title"
        aria-describedby="delete-logic-dialog-description"
      >
        <DialogTitle id="delete-logic-dialog-title">Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-logic-dialog-description">
            {`Are you sure you want to delete "${
              logics.find((l) => l.id === deleteTargetId)?.title || 'this logic'
            }"? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" disabled={isDeleting} variant="contained">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
