// src/app/actions.ts
"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function addTask(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }
  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await db.task.create({
    data: { title, userId: session.user.id },
  });
}
