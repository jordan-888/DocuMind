import { AppBar, Toolbar, Stack, Typography, Avatar, Chip, Button } from '@mui/material';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import supabase from '../lib/supabaseClient';

interface HeaderProps {
  user: {
    id: string;
    email: string;
  } | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'rgba(255,255,255,0.92)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              borderRadius: '22px',
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              boxShadow: 3,
            }}
          >
            <PsychologyRoundedIcon fontSize="small" />
          </Avatar>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              DocuMind
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Document Intelligence Studio
            </Typography>
          </Stack>
        </Stack>

        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              variant="outlined"
              color="primary"
              label={user.email}
              sx={{ borderRadius: '999px', display: { xs: 'none', sm: 'flex' } }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: '999px', px: 3, py: 1 }}
            >
              Sign out
            </Button>
          </Stack>
        ) : (
          <Chip
            icon={<LockRoundedIcon />}
            label="Authentication required"
            color="primary"
            variant="outlined"
            sx={{ borderRadius: '999px' }}
          />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
