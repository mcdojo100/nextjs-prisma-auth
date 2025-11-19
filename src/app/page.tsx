// src/app/page.tsx
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { addTask } from "./actions";
import { AuthButtons } from "@/components/AuthButtons";
import { authOptions } from "@/lib/auth";
import { Paper } from "@mui/material";

export default async function Home() {
  const session = await getServerSession(authOptions);

  //fix this
  let tasks: { id: string; title: string; done: boolean }[] = [];
  if (session?.user?.id) {
    tasks = await db.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, done: true },
    });
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      {session && (
        <form action={addTask} method="POST" className="flex gap-2">
          <input
            name="title"
            placeholder="New task title…"
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Add
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>{t.title}</Paper>
          </li>
        ))}
      </ul>
    </main>
  );
}
