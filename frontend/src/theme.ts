import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const customShadows: Shadows = [
  'none',
  '0 10px 30px rgba(76, 96, 255, 0.08)',
  '0 14px 45px rgba(15, 23, 42, 0.07)',
  '0 16px 60px rgba(15, 23, 42, 0.08)',
  '0 20px 65px rgba(76, 96, 255, 0.08)',
  '0 24px 70px rgba(76, 96, 255, 0.09)',
  '0 28px 75px rgba(15, 23, 42, 0.1)',
  '0 32px 80px rgba(15, 23, 42, 0.12)',
  '0 36px 85px rgba(15, 23, 42, 0.14)',
  '0 40px 90px rgba(76, 96, 255, 0.14)',
  '0 42px 95px rgba(15, 23, 42, 0.15)',
  '0 44px 100px rgba(15, 23, 42, 0.16)',
  '0 46px 105px rgba(76, 96, 255, 0.16)',
  '0 48px 110px rgba(15, 23, 42, 0.17)',
  '0 50px 115px rgba(15, 23, 42, 0.18)',
  '0 52px 120px rgba(76, 96, 255, 0.18)',
  '0 54px 125px rgba(15, 23, 42, 0.19)',
  '0 56px 130px rgba(15, 23, 42, 0.2)',
  '0 58px 135px rgba(76, 96, 255, 0.2)',
  '0 60px 140px rgba(15, 23, 42, 0.21)',
  '0 62px 145px rgba(15, 23, 42, 0.22)',
  '0 64px 150px rgba(76, 96, 255, 0.22)',
  '0 66px 155px rgba(15, 23, 42, 0.23)',
  '0 68px 160px rgba(15, 23, 42, 0.24)',
  '0 70px 165px rgba(15, 23, 42, 0.25)',

// Modern DocuMind Theme - Inspired by contemporary SaaS applications
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Vibrant indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06b6d4', // Cyan
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#fafbff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b', // Slate 500
    },
    divider: 'rgba(99, 102, 241, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(99, 102, 241, 0.05)',
    '0 1px 3px 0 rgba(99, 102, 241, 0.1), 0 1px 2px -1px rgba(99, 102, 241, 0.1)',
    '0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -2px rgba(99, 102, 241, 0.1)',
    '0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -4px rgba(99, 102, 241, 0.1)',
    '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 8px 10px -6px rgba(99, 102, 241, 0.1)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #fafbff 0%, #ffffff 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(99, 102, 241, 0.08)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(99, 102, 241, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(99, 102, 241, 0.08)',
        },
        elevation3: {
          boxShadow: '0 10px 15px rgba(99, 102, 241, 0.1)',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(99, 102, 241, 0.08)',
          boxShadow: '0 1px 3px rgba(99, 102, 241, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
      },
    },
  },
});

export default theme;
