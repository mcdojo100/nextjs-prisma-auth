import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// In Next 16 / Turbopack, `params` is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ unwrap params
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const payload = await req.json();
  const {
    title,
    description,
    intensity,
    importance,
    emotions,
    physicalSensations,
    category,
  } = payload;

  if (!title || typeof intensity !== "number" || typeof importance !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // ensure event exists and belongs to this user
  const existing = await db.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await db.event.update({
    where: { id },
    data: {
      title,
      description: description ?? "",
      intensity,
      importance,
      emotions: Array.isArray(emotions) ? emotions : [],
      physicalSensations: Array.isArray(physicalSensations) ? physicalSensations : [],
      category: category ?? null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ unwrap params here too
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const existing = await db.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
