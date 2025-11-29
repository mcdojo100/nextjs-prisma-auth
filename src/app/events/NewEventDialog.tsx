"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import type { Event as PrismaEvent } from "@prisma/client";
import EventForm from "@/app/events/EventForm"; // ⬅️ adjust path if needed

type NewEventDialogProps = {
  open: boolean;
  onClose: () => void;
  event?: PrismaEvent | null; // if passed → edit mode, else create mode
};

export default function NewEventDialog({
  open,
  onClose,
  event,
}: NewEventDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {event ? "Edit Event" : "New Event"}
      </DialogTitle>

      <DialogContent dividers>
        <EventForm
          event={event}
          onCancel={onClose}
          onSuccess={onClose} // EventForm will router.refresh() and then we just close
        />
      </DialogContent>
    </Dialog>
  );
}
