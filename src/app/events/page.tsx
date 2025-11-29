// src/app/events/page.tsx
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventsPageClient from "./EventsPageClient";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/events");
  }

  const events = await db.event.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <EventsPageClient events={events} />;
}
