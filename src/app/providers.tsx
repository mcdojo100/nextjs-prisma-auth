// src/app/providers.tsx
"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { SessionProvider } from "next-auth/react";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [emotionCache] = React.useState(() => {
    const cache = createCache({ key: "mui", prepend: true });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${emotionCache.key} ${Object.keys(emotionCache.inserted).join(" ")}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(emotionCache.inserted).join(" "),
      }}
    />
  ));

  return (
    <CacheProvider value={emotionCache}>
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </CacheProvider>
  );
}
