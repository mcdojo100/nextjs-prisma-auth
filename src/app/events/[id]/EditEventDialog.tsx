// src/app/events/[id]/EditEventDialog.tsx
"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import type { Event } from "@prisma/client";
import { useRouter } from "next/navigation";
import EventForm from "../EventForm";

type EditEventDialogProps = {
  event: Event;
};

export default function EditEventDialog({ event }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Edit Event
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent dividers>
          <EventForm
            event={event}
            onSuccess={() => {
              setOpen(false);
              router.refresh(); // reload updated event data
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
