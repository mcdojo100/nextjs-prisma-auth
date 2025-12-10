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
  Tabs,
  Tab,
  Input,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import { useRouter } from 'next/navigation'
import SortIcon from '@mui/icons-material/Sort'
import type { Logic as PrismaLogic } from '@prisma/client'
import LogicForm from '../LogicForm'

// Extend the Prisma type so TS knows about the new fields
type LogicWithTitleDesc = PrismaLogic & {
  title: string
  description: string
  perception?: string
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
          perception: selectedLogic.perception,
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
    // reset images / previews / selected files for a fresh create dialog
    setImages([])
    setPreviews([])
    setSelectedFiles([])
    setDialogOpen(true)
  }

  const handleOpenEdit = (logicId: string) => {
    setMode('view-edit')
    setEditingLogicId(logicId)
    // populate images for the selected logic into the Images tab
    const found = logics.find((l) => l.id === logicId)
    setImages(found?.images ?? [])
    setPreviews([])
    setSelectedFiles([])
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
  const [tab, setTab] = useState<number>(0)
  const [images, setImages] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

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
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography variant="h6">Notes</Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Button
            size="small"
            startIcon={<SortIcon />}
            onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            sx={{
              height: '30.75px',
              width: { xs: '100%', sm: 'auto' },
            }}
            onClick={handleOpenCreate}
          >
            New Note
          </Button>
        </Box>
      </Box>

      {/* Logic cards list – full width of container */}
      {logics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No notes yet. Click &quot;New Note&quot; to add your first one.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {sortedLogics.map((logic) => {
            const perception = logic.perception ?? 'Neutral'
            const cardBorderColor =
              perception === 'Positive'
                ? 'success.main'
                : perception === 'Negative'
                  ? 'error.main'
                  : 'divider'

            return (
              <Card
                key={logic.id}
                sx={{ width: '100%', position: 'relative', borderColor: cardBorderColor }}
              >
                {/* make CardActionArea a <div>, not a <button> */}
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
                        {logic.title || 'Untitled note'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatCreatedAt(logic.createdAt as any)}
                      </Typography>
                    </Box>

                    {logic.description && (
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
                        {logic.description}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          })}
        </Stack>
      )}

      {/* Dialog with LogicForm */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
        }}
      >
        <DialogTitle>{formMode === 'create' ? 'New Note' : 'Edit Note'}</DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Details" />
            <Tab label="Images" />
          </Tabs>

          {/* Keep the form mounted so the dialog's submit button (which targets the form by id)
              still works when the user is on the Images tab. We hide it visually when tab !== 0. */}
          <Box sx={{ mt: 1, display: tab === 0 ? 'block' : 'none' }}>
            <LogicForm
              eventId={eventId}
              mode={formMode}
              logicId={formLogicId}
              initialData={formInitialData}
              onSuccess={() => {
                if (formMode === 'create') setMode('create')
                setDialogOpen(false)
                router.refresh()
              }}
              onCancel={handleCloseDialog}
              formId="logic-form"
              hideActions={true}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              images={images}
              setImages={setImages}
            />
          </Box>

          {tab === 1 && (
            <Box sx={{ mt: 1 }}>
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
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <img
                      src={src}
                      alt="note-image"
                      style={{
                        width: 96,
                        height: 64,
                        objectFit: 'cover',
                        borderRadius: 4,
                        cursor: 'pointer',
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
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button type="submit" form="logic-form" variant="contained">
            {formMode === 'create' ? 'Create Note' : 'Save Changes'}
          </Button>
        </DialogActions>
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
              logics.find((l) => l.id === deleteTargetId)?.title || 'this note'
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
