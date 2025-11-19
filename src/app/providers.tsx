// src/app/providers.tsx
"use client";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Button,
  Box,
} from "@mui/material";

import { SessionProvider } from "next-auth/react";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
