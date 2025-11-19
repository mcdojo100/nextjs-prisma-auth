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
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

const Header = ({ session }: { session: Session | null }) => {
  const [value, setValue] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(session?.user ? true : false);
  }, [session]);

  useEffect(() => {
    console.log("Session changed:", session);
  }, [session]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="#app-bar-with-responsive-menu"
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
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
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
