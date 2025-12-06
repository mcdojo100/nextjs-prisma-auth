// src/theme.ts
import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    accent?: Palette['primary']
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary']
  }
}

const spiralSlayerTheme = createTheme({
  palette: {
    mode: 'dark',
    // “Power” color – buttons, links, main actions
    primary: {
      main: '#7C3AED', // violet (Tailwind-esque purple-600)
      light: '#A855F7',
      dark: '#4C1D95',
      contrastText: '#F9FAFB',
    },
    // “Clarity” color – secondary actions, chips, highlights
    secondary: {
      main: '#22D3EE', // cyan
      light: '#67E8F9',
      dark: '#0891B2',
      contrastText: '#020617',
    },
    // A soft but vivid danger color
    error: {
      main: '#F97373',
      light: '#FEA5A5',
      dark: '#DC2626',
      contrastText: '#0B1020',
    },
    warning: {
      main: '#FBBF24',
      light: '#FACC6B',
      dark: '#D97706',
    },
    success: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#15803D',
    },
    // Backgrounds: deep, moody, but not pure black
    background: {
      default: '#050816', // app background
      paper: '#0B1020', // cards, panels
    },
    text: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
      disabled: '#6B7280',
    },
    accent: {
      // optional accent for borders, focus rings, etc.
      main: '#6366F1', // indigo
      light: '#818CF8',
      dark: '#4F46E5',
    },
    divider: 'rgba(148, 163, 184, 0.24)',
  },

  shape: {
    borderRadius: 16, // slightly rounded but not too bubbly
  },

  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.05em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.16em',
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 55%), radial-gradient(circle at bottom, rgba(34,211,238,0.16), transparent 55%), #050816',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(15,23,42,0.98), rgba(30,64,175,0.98))',
          boxShadow: '0 10px 40px rgba(15,23,42,0.7)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.3)',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          background:
            'radial-gradient(circle at top left, rgba(124,58,237,0.08), transparent 55%) , #0B1020',
          borderRadius: 20,
          border: '1px solid rgba(148, 163, 184, 0.25)',
          boxShadow: '0 18px 60px rgba(15, 23, 42, 0.9)',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: '1.4rem',
          paddingBlock: '0.6rem',
        },
        containedPrimary: {
          boxShadow: '0 0 30px rgba(124, 58, 237, 0.45)',
          ':hover': {
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.7)',
          },
        },
        outlinedPrimary: {
          borderWidth: 1.5,
          ':hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(124, 58, 237, 0.06)',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'rgba(124,58,237,0.16)',
        },
        colorSecondary: {
          background: 'rgba(34,211,238,0.1)',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15,23,42,0.8)',
          ':hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(148,163,184,0.7)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7C3AED',
            boxShadow: '0 0 0 1px rgba(124,58,237,0.6)',
          },
        },
        input: {
          '::placeholder': {
            opacity: 0.6,
          },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.08em',
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 999,
          background: 'linear-gradient(90deg, #22D3EE, #7C3AED)', // spiral color swipe
        },
      },
    },
  },
})

export default spiralSlayerTheme
