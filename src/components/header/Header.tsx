'use client'

import { useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Divider,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Session } from 'next-auth'
import { signIn, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

const routes = [
  { label: 'Home', path: '/' },
  { label: 'Events', path: '/events' },
]

const Header = ({ session }: { session: Session | null }) => {
  const router = useRouter()
  const pathname = usePathname()

  const isLoggedIn = !!session?.user

  // Only show Events when logged in
  const visibleRoutes = isLoggedIn ? routes : routes.filter((route) => route.path === '/')

  const currentTab = visibleRoutes.findIndex((route) => {
    if (route.path === '/events') {
      return pathname.startsWith('/events')
    }
    return pathname === route.path
  })

  // Mobile menu state
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null)
  const mobileMenuOpen = Boolean(mobileMenuAnchorEl)

  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget)
  }

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchorEl(null)
  }

  const handleNavClick = (path: string) => {
    router.push(path)
    handleCloseMobileMenu()
  }

  const handleAuthClick = () => {
    if (isLoggedIn) {
      signOut()
    } else {
      signIn('github')
    }
    handleCloseMobileMenu()
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Logo + title (click to go home) */}
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            sx={{ cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            <Image
              src="/spiral-slayer-icon.png"
              alt="Spiral Slayer logo"
              width={32}
              height={32}
              style={{ borderRadius: 8 }}
            />
            {/* On very small screens the title can still fit, but if you want you can hide it with xs:"none" */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: { xs: '.1rem', md: '.3rem' },
                color: 'inherit',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              SPIRAL SLAYER
            </Typography>
          </Box>

          {/* Desktop dividers + tabs + auth button */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 2, display: { xs: 'none', md: 'block' } }}
          />

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Tabs
              value={currentTab === -1 ? false : currentTab}
              variant="scrollable"
              scrollButtons="auto"
            >
              {visibleRoutes.map((route) => (
                <Tab
                  key={route.path}
                  label={route.label}
                  onClick={() => handleNavClick(route.path)}
                  sx={{ minWidth: { xs: 72, sm: 96 } }}
                />
              ))}
            </Tabs>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 2, display: { xs: 'none', md: 'block' } }}
          />

          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            <Button variant="text" onClick={handleAuthClick}>
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </Button>
          </Box>

          {/* Mobile: hamburger menu on the right */}
          <Box sx={{ ml: 'auto', display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="open navigation menu"
              onClick={handleOpenMobileMenu}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile menu contents */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={mobileMenuOpen}
        onClose={handleCloseMobileMenu}
        keepMounted
      >
        {visibleRoutes.map((route) => (
          <MenuItem key={route.path} onClick={() => handleNavClick(route.path)}>
            {route.label}
          </MenuItem>
        ))}
        <MenuItem onClick={handleAuthClick}>
          {isLoggedIn ? 'Sign Out' : 'Sign In with GitHub'}
        </MenuItem>
      </Menu>
    </>
  )
}

export default Header
