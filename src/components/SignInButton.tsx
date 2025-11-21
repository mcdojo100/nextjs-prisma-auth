"use client";

import { Button } from "@mui/material";
import { signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export function SignInButton() {
  return (
    <Button
      variant="text"
      onClick={() => {
        signIn("github");
      }}
    >
      {"Sign In"}
    </Button>
  );
}
