// src/app/events/[id]/page.tsx
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Box, Paper, Typography, Button } from "@mui/material";
import EventForm from "../EventForm";
import Link from "next/link";

const prisma = new PrismaClient();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) notFound();

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) notFound();

  return (
    <Box sx={{ mt: 2 }}>
      {/* Title + Create button row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Edit Event</Typography>

        <Link href="/events" passHref>
          <Button variant="contained">Back to Events</Button>
        </Link>
      </Box>
      <EventForm event={event} />
    </Box>
  );
}
