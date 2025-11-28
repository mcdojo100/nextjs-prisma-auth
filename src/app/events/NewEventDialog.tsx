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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
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
  const [physicalSensations, setPhysicalSensations] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
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
            emotions,
            category,
            physicalSensations,
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
      setEmotions([]);
      setPhysicalSensations([]);
      setCategory("");

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

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
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
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel id="emotions-label">Emotions</InputLabel>
                <Select
                  labelId="emotions-label"
                  multiple
                  value={emotions}
                  onChange={(e) =>
                    setEmotions(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : (e.target.value as string[])
                    )
                  }
                  renderValue={(selected) =>
                    (selected as string[]).length ? (selected as string[]).join(", ") : "None"
                  }
                  label="Emotions"
                >
                  {[
                    "anger",
                    "sadness",
                    "anxiety",
                    "numbness",
                    "confusion",
                    "shame",
                    "hope",
                    "calm",
                  ].map((emo) => (
                    <MenuItem key={emo} value={emo}>
                      <Checkbox checked={emotions.includes(emo)} />
                      <ListItemText primary={emo[0].toUpperCase() + emo.slice(1)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel id="physical-sensations-label">Physical Sensations</InputLabel>
                <Select
                  labelId="physical-sensations-label"
                  multiple
                  value={physicalSensations}
                  onChange={(e) =>
                    setPhysicalSensations(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : (e.target.value as string[])
                    )
                  }
                  renderValue={(selected) =>
                    (selected as string[]).length ? (selected as string[]).join(", ") : "None"
                  }
                  label="Physical Sensations"
                >
                  {[
                    "Tight Chest",
                    "Butterflies",
                    "Headache",
                    "Warmth",
                    "Shaky",
                    "Tension",
                    "Shortness of Breath",
                    "Fatigue",
                  ].map((sensation) => (
                    <MenuItem key={sensation} value={sensation}>
                      <Checkbox checked={physicalSensations.includes(sensation)} />
                      <ListItemText primary={sensation} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as string)}
                  label="Category"
                >
                  {["work", "relationship", "self", "family", "health"].map((c) => (
                    <MenuItem key={c} value={c}>
                      {c[0].toUpperCase() + c.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
