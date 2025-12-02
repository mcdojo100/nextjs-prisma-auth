// src/app/api/events/[id]/logic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // this is the eventId

  try {
    const body = await request.json();
    const {
      title,
      description,
      importance,
      status,
      facts,
      assumptions,
      patterns,
      actions,
    } = body;

    // Basic validation
    if (
      typeof importance !== "number" ||
      importance < 1 ||
      importance > 10 ||
      !status ||
      !facts ||
      !assumptions ||
      !patterns ||
      !actions
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Optional: verify event exists
    const event = await db.event.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const logic = await db.logic.create({
      data: {
        title: title ?? "",
        description: description ?? "",
        importance,
        status,
        facts,
        assumptions,
        patterns,
        actions,
        eventId: id,
      },
    });

    return NextResponse.json(logic, { status: 201 });
  } catch (err) {
    console.error("Error creating logic:", err);
    return NextResponse.json(
      { error: "Failed to create logic" },
      { status: 500 }
    );
  }
}
