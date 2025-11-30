"use client";

import {
  AppBar,
  Box,
  Button,
  Divider,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const routes = [
  { label: "Home", path: "/" },
  { label: "Events", path: "/events" },
  { label: "Logic", path: "/logic" },
];

const Header = ({ session }: { session: Session | null }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = !!session?.user;

  // Only show Events + Logic when logged in
  const visibleRoutes = isLoggedIn
    ? routes
    : routes.filter((route) => route.path === "/");

  const currentTab = visibleRoutes.findIndex((route) => {
    // Handle nested Events routes
    if (route.path === "/events") {
      return pathname.startsWith("/events");
    }

    // Handle nested Logic routes
    if (route.path === "/logic") {
      return pathname.startsWith("/logic");
    }

    // Default exact matching for Home or other tabs
    return pathname === route.path;
  });

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          APP NAME
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
          <Tabs value={currentTab === -1 ? false : currentTab}>
            {visibleRoutes.map((route) => (
              <Tab
                key={route.path}
                label={route.label}
                onClick={() => {
                  router.push(route.path);
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

        <Box sx={{ flexGrow: 0 }}>
          <Button
            variant="text"
            onClick={
              isLoggedIn
                ? () => {
                    signOut();
                  }
                : () => {
                    signIn("github");
                  }
            }
          >
            {isLoggedIn ? "Sign Out" : "Sign In"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
