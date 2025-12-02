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
      {/* Top header row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* Back button (top-left) */}
        <Button
          variant="text"
          color="primary"
          onClick={() => router.push("/events")}
        >
          ← Back to Events
        </Button>

        {/* Edit button (top-right) */}
        <Button variant="outlined" onClick={() => setOpen(true)}>
          Edit Event
        </Button>
      </Box>

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
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
