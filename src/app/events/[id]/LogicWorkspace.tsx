// src/app/events/[id]/LogicWorkspace.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import type { Logic } from "@prisma/client";
import LogicForm from "../LogicForm";

type LogicWorkspaceProps = {
  eventId: string;
  logics: Logic[];
};

export default function LogicWorkspace({
  eventId,
  logics,
}: LogicWorkspaceProps) {
  const [selectedLogicId, setSelectedLogicId] = useState<string | null>(
    logics[0]?.id ?? null
  );
  const [mode, setMode] = useState<"view-edit" | "create">(
    logics.length > 0 ? "view-edit" : "create"
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedLogic = useMemo(
    () => logics.find((l) => l.id === selectedLogicId) || null,
    [logics, selectedLogicId]
  );

  // Decide if the form is in create or edit mode
  const formMode: "create" | "edit" =
    mode === "view-edit" && selectedLogic ? "edit" : "create";

  const formInitialData =
    formMode === "edit" && selectedLogic
      ? {
          importance: selectedLogic.importance,
          status: selectedLogic.status,
          facts: selectedLogic.facts,
          assumptions: selectedLogic.assumptions,
          patterns: selectedLogic.patterns,
          actions: selectedLogic.actions,
        }
      : undefined;

  const formLogicId =
    formMode === "edit" && selectedLogic ? selectedLogic.id : undefined;

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedLogicId(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (logicId: string) => {
    setMode("view-edit");
    setSelectedLogicId(logicId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Logic</Typography>
        <Button variant="contained" size="small" onClick={handleOpenCreate}>
          + New Logic
        </Button>
      </Box>

      {/* Logic cards list – full width of container */}
      {logics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No Logic items yet. Click &quot;New Logic&quot; to add your first one.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {logics.map((logic) => (
            <Card
              key={logic.id}
              variant={logic.id === selectedLogicId ? "outlined" : undefined}
              sx={{
                width: "100%", // take full width of the parent Stack/container
                borderColor:
                  logic.id === selectedLogicId ? "primary.main" : "divider",
              }}
            >
              <CardActionArea onClick={() => handleOpenEdit(logic.id)}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="subtitle1" noWrap>
                      {logic.status || "No status"}
                    </Typography>
                    <Chip label={`Imp: ${logic.importance}`} size="small" />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {logic.facts}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog with LogicForm */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {formMode === "create" ? "New Logic" : "Edit Logic"}
        </DialogTitle>
        <DialogContent dividers>
          <LogicForm
            eventId={eventId}
            mode={formMode}
            logicId={formLogicId}
            initialData={formInitialData}
            onSuccess={() => {
              // After success, close dialog.
              // You can also tweak behavior here if you want to stay in create mode, etc.
              if (formMode === "create") {
                setMode("create");
                setSelectedLogicId(null);
              }
              setDialogOpen(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
