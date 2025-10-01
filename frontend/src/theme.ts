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
];

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f7ff',
      paper: '#ffffff',
    },
    primary: {
      light: '#93a6ff',
      main: '#4c60ff',
      dark: '#2c38af',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#67e8f9',
      main: '#06b6d4',
      dark: '#0e7490',
      contrastText: '#043240',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: {
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 24,
  },
  shadows: customShadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 10px 30px rgba(76, 96, 255, 0.25)',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 28,
          border: '1px solid rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 32,
          border: '1px solid rgba(76, 96, 255, 0.12)',
          boxShadow: '0 30px 80px -60px rgba(76, 96, 255, 0.65)',
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
