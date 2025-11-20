// src/app/events/page.tsx
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, send to sign-in
  if (!session?.user?.id) {
    redirect("/");
  }

  const events = await db.event.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (events.length === 0) {
    return (
      <Box>
        <Typography variant="body1">
          You don&apos;t have any events yet.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Click &quot;Create Event&quot; above to add your first one.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {events.map((event) => (
        <Card key={event.id} variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                mb: 1,
              }}
            >
              <Typography variant="h6">{event.title}</Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  size="small"
                  label={`Intensity: ${event.intensity}/10`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`Importance: ${event.importance}/10`}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Box>

            {event.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {event.description}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.5 }}
            >
              Created: {event.createdAt.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
