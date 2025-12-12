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
  { label: 'Activity', path: '/activity' }, // ✅ NEW
  { label: 'Analysis', path: '/analysis' },
]

const Header = ({ session }: { session: Session | null }) => {
  const router = useRouter()
  const pathname = usePathname()

  const isLoggedIn = !!session?.user

  // Only show Events when logged in
  const visibleRoutes = isLoggedIn ? routes : routes.filter((route) => route.path === '/')

  const currentTab = visibleRoutes.findIndex((route) => {
    // Root must match exactly; other routes match on prefix so subpaths count
    if (route.path === '/') return pathname === '/'
    return pathname.startsWith(route.path)
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
      handleCloseMobileMenu()
    } else {
      // Open desktop auth menu when on larger screens; on mobile the menu shows explicit providers
      handleOpenMobileMenu as unknown as () => void
    }
  }

  // Desktop auth menu (when not logged in show options)
  const [authMenuAnchorEl, setAuthMenuAnchorEl] = useState<null | HTMLElement>(null)
  const authMenuOpen = Boolean(authMenuAnchorEl)

  const handleOpenAuthMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAuthMenuAnchorEl(event.currentTarget)
  }

  const handleCloseAuthMenu = () => {
    setAuthMenuAnchorEl(null)
  }

  const handleSignInProvider = (provider: string) => {
    signIn(provider)
    handleCloseAuthMenu()
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
            {isLoggedIn ? (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => signOut()}
                sx={{ textTransform: 'none', ml: 1, height: '30.75px' }}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleOpenAuthMenu}
                  sx={{ textTransform: 'none', ml: 1, height: '30.75px' }}
                >
                  Sign In
                </Button>
                <Menu
                  anchorEl={authMenuAnchorEl}
                  open={authMenuOpen}
                  onClose={handleCloseAuthMenu}
                  keepMounted
                >
                  <MenuItem onClick={() => handleSignInProvider('github')}>
                    Sign In with GitHub
                  </MenuItem>
                  <MenuItem onClick={() => handleSignInProvider('google')}>
                    Sign In with Google
                  </MenuItem>
                </Menu>
              </>
            )}
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
        {isLoggedIn ? (
          <MenuItem
            onClick={() => {
              signOut()
              handleCloseMobileMenu()
            }}
          >
            Sign Out
          </MenuItem>
        ) : (
          [
            <MenuItem key="github" onClick={() => handleSignInProvider('github')}>
              Sign In with GitHub
            </MenuItem>,
            <MenuItem key="google" onClick={() => handleSignInProvider('google')}>
              Sign In with Google
            </MenuItem>,
          ]
        )}
      </Menu>
    </>
  )
}

export default Header
