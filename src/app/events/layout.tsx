// app/events/layout.tsx
import { Box, Button, Typography } from "@mui/material";
import NewEventButton from "./NewEventButton";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Events</Typography>
        <NewEventButton />
      </Box>
      {children}
    </Box>
  );
}
