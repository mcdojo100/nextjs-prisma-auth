"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  Box,
  TextField,
  Typography,
  Slider,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";

type LogicFormProps = {
  eventId: string;
  logicId?: string;
  initialData?: {
    importance: number;
    status: string;
    facts: string;
    assumptions: string;
    patterns: string;
    actions: string;
  };
  mode?: "create" | "edit";
  onSuccess?: () => void;
};

export default function LogicForm({
  eventId,
  logicId,
  initialData,
  mode = "create",
  onSuccess,
}: LogicFormProps) {
  const router = useRouter();

  const [importance, setImportance] = useState(initialData?.importance ?? 5);
  const [status, setStatus] = useState(initialData?.status ?? "");
  const [facts, setFacts] = useState(initialData?.facts ?? "");
  const [assumptions, setAssumptions] = useState(
    initialData?.assumptions ?? ""
  );
  const [patterns, setPatterns] = useState(initialData?.patterns ?? "");
  const [actions, setActions] = useState(initialData?.actions ?? "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Key: keep form state in sync with selected Logic / mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setImportance(initialData.importance);
      setStatus(initialData.status);
      setFacts(initialData.facts);
      setAssumptions(initialData.assumptions);
      setPatterns(initialData.patterns);
      setActions(initialData.actions);
    }

    if (mode === "create" && !initialData) {
      setImportance(5);
      setStatus("");
      setFacts("");
      setAssumptions("");
      setPatterns("");
      setActions("");
    }
  }, [initialData, mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "create"
          ? `/api/events/${eventId}/logic`
          : `/api/logic/${logicId}`;

      if (mode === "edit" && !logicId) {
        throw new Error("Missing logicId for edit mode");
      }

      const res = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importance,
          status,
          facts,
          assumptions,
          patterns,
          actions,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save logic");
      }

      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography gutterBottom>Importance (1–10)</Typography>
          <Slider
            value={importance}
            onChange={(_, value) => {
              if (typeof value === "number") setImportance(value);
            }}
            step={1}
            min={1}
            max={10}
            valueLabelDisplay="on"
          />
        </Box>

        <TextField
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Facts"
          value={facts}
          onChange={(e) => setFacts(e.target.value)}
          fullWidth
          required
          multiline
          minRows={3}
        />

        <TextField
          label="Assumptions"
          value={assumptions}
          onChange={(e) => setAssumptions(e.target.value)}
          fullWidth
          required
          multiline
          minRows={3}
        />

        <TextField
          label="Patterns"
          value={patterns}
          onChange={(e) => setPatterns(e.target.value)}
          fullWidth
          required
          multiline
          minRows={3}
        />

        <TextField
          label="Actions"
          value={actions}
          onChange={(e) => setActions(e.target.value)}
          fullWidth
          required
          multiline
          minRows={3}
        />

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}
        >
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {mode === "create" ? "Add Logic" : "Save Changes"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
