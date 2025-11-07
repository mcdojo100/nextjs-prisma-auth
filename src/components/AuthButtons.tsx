// src/components/AuthButtons.tsx
"use client";

import { signIn, signOut } from "next-auth/react";

export function AuthButtons() {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => signIn("github")}
        className="rounded-xl border px-4 py-2"
      >
        Sign in with GitHub
      </button>
      <button onClick={() => signOut()} className="rounded-xl border px-4 py-2">
        Sign out
      </button>
    </div>
  );
}
