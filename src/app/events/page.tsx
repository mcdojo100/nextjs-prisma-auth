"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Events() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (!session) {
    redirect("/");
  }

  return <div>Events Page</div>;
}
