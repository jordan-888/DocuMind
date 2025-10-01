import { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import BookRoundedIcon from '@mui/icons-material/BookRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import type { SearchResponse } from '../types';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  results: SearchResponse | null;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, results }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
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
          boxShadow: '0 25px 80px -60px rgba(76,96,255,0.55)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(236,248,255,0.96))',
        }}
      >
        <Stack spacing={3} position="relative" zIndex={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={1.5} flex={1}>
              <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.2em' }}>
                Ask anything
              </Typography>
              <TextField
                id="semantic-search"
                placeholder="e.g. Summarize the Q4 compliance requirements"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
                InputProps={{
                  startAdornment: <SearchRoundedIcon color="primary" sx={{ mr: 1 }} />,
                  sx: {
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: 'inset 0 0 0 1px rgba(76,96,255,0.08)',
                  },
                }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AutoAwesomeRoundedIcon />}
                sx={{
                  borderRadius: '999px',
                  px: 4,
                  py: 1.5,
                  backgroundImage: 'linear-gradient(135deg, #4c60ff 0%, #06b6d4 100%)',
                  boxShadow: '0 18px 45px -22px rgba(76,96,255,0.55)',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(135deg, #3d4be0 0%, #0593b3 100%)',
                  },
                }}
              >
                Launch search
              </Button>
              <Tooltip title="Adjust embedding strategies (coming soon)">
                <Chip
                  icon={<TuneRoundedIcon />}
                  label="Adjustable embeddings"
                  variant="outlined"
                  sx={{ borderRadius: '999px' }}
                />
              </Tooltip>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip label='Try: "Key findings from 2024 strategy deck"' variant="outlined" sx={{ borderRadius: '999px' }} />
            <Chip label='Try: "Compare vendor compliance clauses"' variant="outlined" sx={{ borderRadius: '999px' }} />
          </Stack>
        </Stack>
      </Paper>

      {results && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  Results surfaced
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {results.total_results} passages ranked by semantic relevance.
                </Typography>
              </Stack>
              <Chip
                icon={<AccessTimeRoundedIcon />}
                label={`Processed in ${results.execution_time.toFixed(2)}s`}
                variant="outlined"
                sx={{ borderRadius: '999px' }}
              />
            </Stack>
          </Paper>

          <Stack spacing={3}>
            {results.results.map((result, index) => {
              const category = result.document.metadata?.category ?? 'Document corpus';
              const storageProvider = result.document.metadata?.storage_provider ?? 'Supabase';

              return (
                <Card
                  key={`${result.document.id}-${index}`}
                  variant="outlined"
                  sx={{
                    borderRadius: 4,
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 30px 80px -60px rgba(76,96,255,0.45)',
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            {result.document.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Chunk {result.chunk.chunk_index}
                          </Typography>
                        </Stack>
                        <Chip
                          icon={<QueryStatsRoundedIcon />}
                          label={`${(result.similarity_score * 100).toFixed(1)}% match`}
                          color="primary"
                          variant="outlined"
                          sx={{ borderRadius: '999px' }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {result.chunk.text}
                      </Typography>

                      <Divider />

                      <Stack direction="row" spacing={1.5} flexWrap="wrap">
                        <Chip
                          icon={<BookRoundedIcon />}
                          label={category}
                          variant="outlined"
                          sx={{ borderRadius: '12px' }}
                        />
                        <Chip
                          icon={<StorageRoundedIcon />}
                          label={`Vector store: ${storageProvider}`}
                          variant="outlined"
                          sx={{ borderRadius: '12px' }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default SearchInterface;

