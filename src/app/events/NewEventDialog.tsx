"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

type NewEventDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (event: any) => void; // optional callback
};

export default function NewEventDialog({
  open,
  onClose,
  onCreated,
}: NewEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState<number>(5);
  const [importance, setImportance] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          intensity,
          importance,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create event");
      }

      const created = await res.json();
      onCreated?.(created);

      // reset form
      setTitle("");
      setDescription("");
      setIntensity(5);
      setImportance(5);

      onClose();
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>New Event</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                  fontSize: 14,
                }}
              >
                <span>Intensity</span>
                <span>{intensity}</span>
              </Box>
              <Slider
                value={intensity}
                onChange={(_, value) => setIntensity(value as number)}
                step={1}
                min={1}
                max={10}
              />
            </Box>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                  fontSize: 14,
                }}
              >
                <span>Importance</span>
                <span>{importance}</span>
              </Box>
              <Slider
                value={importance}
                onChange={(_, value) => setImportance(value as number)}
                step={1}
                min={1}
                max={10}
              />
            </Box>

            {error && (
              <Box sx={{ color: "error.main", fontSize: 14 }}>{error}</Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create Event"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
