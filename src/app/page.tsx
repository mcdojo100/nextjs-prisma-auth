// src/app/page.tsx
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { addTask } from "./actions";
import { AuthButtons } from "@/components/AuthButtons";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

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
      <h1 className="text-2xl font-bold">Next.js + Prisma + Auth</h1>

      <div className="flex items-center justify-between">
        <div>
          {session ? (
            <p className="text-sm">
              Signed in as <b>{session.user?.email ?? session.user?.name}</b>
            </p>
          ) : (
            <p className="text-sm">You’re not signed in.</p>
          )}
        </div>
        <AuthButtons />
      </div>

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
          <li key={t.id} className="rounded border bg-white px-3 py-2">
            {t.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
