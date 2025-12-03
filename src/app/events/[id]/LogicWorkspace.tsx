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
  IconButton,
  DialogContentText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import type { Logic as PrismaLogic } from "@prisma/client";
import LogicForm from "../LogicForm";

// Extend the Prisma type so TS knows about the new fields
type LogicWithTitleDesc = PrismaLogic & {
  title: string;
  description: string;
};

type LogicWorkspaceProps = {
  eventId: string;
  logics: LogicWithTitleDesc[];
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
          title: selectedLogic.title,
          description: selectedLogic.description,
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

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const openDeleteDialog = (logicId: string) => {
    setDeleteTargetId(logicId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/logic/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      closeDeleteDialog();
      router.refresh();
    } catch (err) {
      console.error("Delete failed", err);
      // keep dialog open or close depending on preference
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
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
                width: "100%",
                position: "relative",
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
                      {logic.title || "Untitled logic"}
                    </Typography>
                
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {new Date(logic.createdAt).toLocaleString()}
                    </Typography>
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
                    {logic.description ?? "No description provided."}
                  </Typography>
                </CardContent>
              </CardActionArea>

              {/* Delete button positioned upper-right */}
              <IconButton
                aria-label={`delete-logic-${logic.id}`}
                size="small"
                onClick={() => openDeleteDialog(logic.id)}
                sx={{ position: "absolute", top: 8, right: 8 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog with LogicForm */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
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
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-logic-dialog-title"
        aria-describedby="delete-logic-dialog-description"
      >
        <DialogTitle id="delete-logic-dialog-title">Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-logic-dialog-description">
            {`Are you sure you want to delete "${
              logics.find((l) => l.id === deleteTargetId)?.title || "this logic"
            }"? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={isDeleting}
            variant="contained"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
