"use client";

import { Button } from "@mui/material";
import { useState } from "react";
import NewEventDialog from "./NewEventDialog";

export default function NewEventButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        sx={{ textTransform: "none" }}
        onClick={() => setOpen(true)}
      >
        + Create Event
      </Button>

      <NewEventDialog
        open={open}
        onClose={() => setOpen(false)}
        // onCreated={(event) => { /* optional: update local state */ }}
      />
    </>
  );
}
