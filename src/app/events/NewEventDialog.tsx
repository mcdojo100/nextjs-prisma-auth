'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import type { Event as PrismaEvent } from '@prisma/client'
import EventForm from '@/app/events/EventForm' // ⬅️ adjust path if needed

type NewEventDialogProps = {
  open: boolean
  onClose: () => void
  event?: PrismaEvent | null // if passed → edit mode, else create mode
}

export default function NewEventDialog({ open, onClose, event }: NewEventDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
      }}
    >
      <DialogTitle>{event ? 'Edit Event' : 'New Event'}</DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
        <EventForm
          event={event}
          onCancel={onClose}
          onSuccess={onClose} // EventForm will router.refresh() and then we just close
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="event-form" variant="contained">
          {event ? 'Save Changes' : 'Create Event'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
