// app/events/layout.tsx
"use client";

import { Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import NewEventButton from "./NewEventButton";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // true only when ON the main events page
  // meaning: /events   (but NOT /events/[id])
  const isEventsListPage = pathname === "/events";

  return (
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  );
}
