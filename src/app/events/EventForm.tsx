"use client";

import {
  Box,
  Button,
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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Event as PrismaEvent } from "@prisma/client";

type EventFormProps = {
  event?: PrismaEvent | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function EventForm({
  event: initialEvent,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState<number>(5);
  const [importance, setImportance] = useState<number>(5);
  const [physicalSensations, setPhysicalSensations] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [verificationStatus, setVerificationStatus] =
    useState<string>("Pending");
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description);
      setIntensity(initialEvent.intensity);
      setImportance(initialEvent.importance);
      setEmotions(initialEvent.emotions ?? []);
      setPhysicalSensations(initialEvent.physicalSensations ?? []);
      // Normalize existing database values to one of the UI options
      const statuses = [
        "Verified True",
        "Verified False",
        "Pending",
        "True without Verification",
        "Question Mark",
        "Closed - Past/Unverified",
      ];
      const normalize = (s?: string) =>
        (s ?? "")
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
      const mapStatus = (s?: string) => {
        const ns = normalize(s);
        if (!ns) return "Pending";
        const found = statuses.find((opt) => {
          const no = normalize(opt);
          return no === ns || no.startsWith(ns) || ns.startsWith(no);
        });
        return found ?? "Pending";
      };
      setVerificationStatus(mapStatus(initialEvent.verificationStatus));
      setCategory(initialEvent.category ?? "");
    } else {
      setTitle("");
      setDescription("");
      setIntensity(5);
      setImportance(5);
      setEmotions([]);
      setPhysicalSensations([]);
      setVerificationStatus("Pending");
      setCategory("");
    }
  }, [initialEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let res: Response;

      if (initialEvent?.id) {
        // update existing
        res = await fetch(`/api/events/${initialEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            intensity,
            importance,
            emotions,
            category,
            physicalSensations,
            verificationStatus,
          }),
        });

        if (!res.ok) throw new Error("Failed to update event");
      } else {
        // create new
        res = await fetch("/api/events", {
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
            verificationStatus,
          }),
        });

        if (!res.ok) throw new Error("Failed to create event");
      }

      if (!initialEvent) {
        setTitle("");
        setDescription("");
        setIntensity(5);
        setImportance(5);
        setEmotions([]);
        setPhysicalSensations([]);
        setVerificationStatus("Pending");
        setCategory("");
      }

      router.push("/events");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(); // let parent do extra stuff if it wants (e.g., close dialog)
    } else {
      router.push("/events"); // default: go back to list
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
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

        <FormControl fullWidth>
          <InputLabel id="verification-status-label">
            Verification Status
          </InputLabel>
          <Select
            labelId="verification-status-label"
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value as string)}
            label="Verification Status"
          >
            {[
              "Verified True",
              "Verified False",
              "Pending",
              "True without Verification",
              "Question Mark",
              "Closed - Past/Unverified",
            ].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
                  : (e.target.value as string[]),
              )
            }
            renderValue={(selected) =>
              (selected as string[]).length
                ? (selected as string[]).join(", ")
                : "None"
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

        <FormControl fullWidth>
          <InputLabel id="physical-sensations-label">
            Physical Sensations
          </InputLabel>
          <Select
            labelId="physical-sensations-label"
            multiple
            value={physicalSensations}
            onChange={(e) =>
              setPhysicalSensations(
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : (e.target.value as string[]),
              )
            }
            renderValue={(selected) =>
              (selected as string[]).length
                ? (selected as string[]).join(", ")
                : "None"
            }
            label="Physical Sensations"
          >
            {[
              "Tight Chest",
              "Butterflies/Stomach Flutters",
              "Headache/Pressure",
              "Warmth or Heat in the Body",
              "Shaky or Trembling",
              "Tension in Shoulders/Neck",
              "Shortness of Breath",
              "Fatigue/Heavy Limbs",
            ].map((s) => (
              <MenuItem key={s} value={s}>
                <Checkbox checked={physicalSensations.includes(s)} />
                <ListItemText primary={s} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        {error && <Box sx={{ color: "error.main", fontSize: 14 }}>{error}</Box>}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}
        >
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : initialEvent
                ? "Save Changes"
                : "Create Event"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
