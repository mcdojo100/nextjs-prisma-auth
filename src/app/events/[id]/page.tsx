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
    <Box
      component="main"
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 4,
        px: 2,
      }}
    >
      <Paper sx={{ width: "100%", p: 3 }}>
        {/* Title + Back button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Edit Event</Typography>

          <Link href="/events" passHref>
            <Button variant="outlined" size="small">
              Back to Events
            </Button>
          </Link>
        </Box>

        <EventForm event={event} />
      </Paper>
    </Box>
  );
}
