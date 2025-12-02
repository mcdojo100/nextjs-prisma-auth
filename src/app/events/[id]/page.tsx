// src/app/events/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Box, Button, Typography, Divider } from "@mui/material";
import { db } from "@/lib/db";
import EditEventDialog from "./EditEventDialog";
import LogicWorkspace from "./LogicWorkspace";

type PageProps = {
  // Next 15/16: params is a Promise
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // 1) Fetch the Event *without* include
  const event = await db.event.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  // 2) Fetch the Logics for this Event separately
  const logics = await db.logic.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header: Event title + actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">{event.title}</Typography>
          {event.createdAt && (
            <Typography variant="body2" color="text.secondary">
              Created: {event.createdAt.toLocaleDateString()}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
          <Link href="/events">
            <Button variant="text">← Back to Events</Button>
          </Link>
          <EditEventDialog event={event} />
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Logic workspace gets the separate logics array */}
      <LogicWorkspace eventId={event.id} logics={logics} />
    </Box>
  );
}
