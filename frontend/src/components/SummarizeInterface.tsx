import { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import type { SummarizeResponse } from '../types';

interface SummarizeInterfaceProps {
  onSummarize: (query: string) => void;
  summary: SummarizeResponse | null;
}

const SummarizeInterface: React.FC<SummarizeInterfaceProps> = ({ onSummarize, summary }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      onSummarize(query.trim());
    }
  };

  return (
    <Stack spacing={3}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 4, md: 6 },
          py: { xs: 5, md: 6 },
          borderRadius: 5,
          background: 'linear-gradient(135deg, rgba(236,253,245,0.9), rgba(224,244,255,0.92))',
          boxShadow: '0 25px 80px -60px rgba(15,118,110,0.45)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={1.5} flex={1}>
            <Typography variant="overline" color="success.main" sx={{ letterSpacing: '0.2em' }}>
              Generate insights
            </Typography>
            <TextField
              id="summarize-input"
              placeholder="e.g. Summarize the latest security protocols across all uploaded docs"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              InputProps={{
                startAdornment: <AutoAwesomeRoundedIcon color="success" sx={{ mr: 1 }} />,
                sx: {
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.12)',
                },
              }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<InsightsRoundedIcon />}
              sx={{
                borderRadius: '999px',
                px: 4,
                py: 1.5,
                backgroundImage: 'linear-gradient(135deg, #059669 0%, #4c60ff 100%)',
                boxShadow: '0 18px 45px -22px rgba(16,185,129,0.45)',
                '&:hover': {
                  backgroundImage: 'linear-gradient(135deg, #047857 0%, #3d4be0 100%)',
                },
              }}
            >
              Summarize
            </Button>
            <Chip
              icon={<TimelineRoundedIcon />}
              label="Multi-document reasoning"
              variant="outlined"
              sx={{ borderRadius: '999px', color: 'success.main', borderColor: 'rgba(16,185,129,0.35)' }}
            />
          </Stack>
        </Stack>
      </Paper>

      {summary && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  AI summary
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.document_ids?.length ?? 0} document(s) referenced · Mode {summary.mode}
                </Typography>
              </Stack>
              <Chip
                icon={<TimerRoundedIcon />}
                label={`Processed in ${summary.processing_time.toFixed(2)}s`}
                variant="outlined"
                sx={{ borderRadius: '999px' }}
              />
            </Stack>
          </Paper>

          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {summary.summary}
              </Typography>
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 220,
                borderRadius: 4,
                backgroundColor: 'rgba(236,253,245,0.6)',
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Chip
                    icon={<FunctionsRoundedIcon />}
                    label="Query"
                    variant="outlined"
                    sx={{ borderRadius: '999px', width: 'fit-content' }}
                  />
                  <Typography variant="body2" color="text.primary">
                    {summary.query ?? 'N/A'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 220,
                borderRadius: 4,
                backgroundColor: 'rgba(224,244,255,0.6)',
              }}
            >
              <CardContent>
                <Stack spacing={0.5}>
                  <Chip
                    icon={<QueryStatsRoundedIcon />}
                    label="Model"
                    variant="outlined"
                    sx={{ borderRadius: '999px', width: 'fit-content' }}
                  />
                  <Typography variant="body2" color="text.primary">
                    {summary.model_info.model_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {summary.model_info.type}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 220,
                borderRadius: 4,
                backgroundColor: 'rgba(236,252,255,0.6)',
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Chip
                    icon={<TimelineRoundedIcon />}
                    label="Summary length"
                    variant="outlined"
                    sx={{ borderRadius: '999px', width: 'fit-content' }}
                  />
                  <Typography variant="body2" color="text.primary">
                    {summary.model_info.min_length} - {summary.model_info.max_length} chars
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Divider sx={{ mt: 1 }} />
        </Stack>
      )}
    </Stack>
  );
};

export default SummarizeInterface;

