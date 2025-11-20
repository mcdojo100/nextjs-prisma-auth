import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, intensity, importance } = await req.json();

  if (!title || typeof intensity !== "number" || typeof importance !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const event = await db.event.create({
    data: {
      title,
      description: description ?? "",
      intensity,
      importance,
      userId: session.user.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
