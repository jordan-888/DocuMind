import { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Chip,
  Button,
  InputAdornment,
  Alert,
  Fade,
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import supabase from '../lib/supabaseClient';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage('✅ Login successful! Redirecting...');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('✅ Welcome aboard! Check your inbox to confirm your account.');
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 4, md: 6 },
        py: { xs: 5, md: 7 },
        borderRadius: 6,
        boxShadow: '0 40px 120px -60px rgba(76, 96, 255, 0.35)',
        bgcolor: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(76, 96, 255, 0.12)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-35% auto auto -20%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(76,96,255,0.18), rgba(6,182,212,0.18))',
          filter: 'blur(0px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 'auto -25% -40% auto',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.22), rgba(76,96,255,0.12))',
          filter: 'blur(0px)',
        },
      }}
    >
      <Stack spacing={5} position="relative" zIndex={2}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Chip
            icon={<LockRoundedIcon />}
            label="Supabase-authenticated workspace"
            color="primary"
            variant="outlined"
            sx={{ borderRadius: '999px', px: 1 }}
          />
          <Typography variant="h4" fontWeight={600} color="text.primary">
            {isLogin ? 'Welcome back' : 'Create your access'}
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={360}>
            {isLogin
              ? 'Sign in to continue orchestrating document intelligence.'
              : 'Spin up your account in seconds and start uploading knowledge assets.'}
          </Typography>
        </Stack>

        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          <TextField
            id="auth-email"
            label="Work email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AlternateEmailRoundedIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            id="auth-password"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyRoundedIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            loading={loading}
            loadingPosition="start"
            startIcon={<MeetingRoomRoundedIcon />}
            variant="contained"
            size="large"
            sx={{
              borderRadius: '999px',
              py: 1.5,
              fontSize: 15,
              backgroundImage: 'linear-gradient(135deg, #4c60ff 0%, #06b6d4 100%)',
              boxShadow: '0 18px 45px -22px rgba(76, 96, 255, 0.65)',
              '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #3d4be0 0%, #0593b3 100%)',
              },
            }}
          >
            {isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {isLogin ? 'New to DocuMind?' : 'Already onboard?'}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setIsLogin((prev) => !prev)}
            startIcon={<SwapHorizRoundedIcon fontSize="small" />}
            sx={{ borderRadius: '999px', textTransform: 'none' }}
          >
            {isLogin ? 'Create account' : 'Sign in instead'}
          </Button>
        </Stack>

        <Fade in={Boolean(message)}>
          <Alert
            severity={message.startsWith('✅') ? 'success' : 'error'}
            variant="outlined"
            icon={false}
            sx={{ borderRadius: 4 }}
          >
            {message.replace(/^✅\s*/, '').replace(/^❌\s*/, '')}
          </Alert>
        </Fade>
      </Stack>
    </Paper>
  );
};

export default Auth;

