// src/app/events/[id]/EditEventDialog.tsx
"use client";

import { useState } from "react";
import {
  Box,
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
      {/* Edit button (top-right) */}
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Edit Event
      </Button>

      {/* Dialog */}
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
              router.refresh();
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
