import { type ReactElement } from 'react';
import {
  Stack,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import type { Document } from '../types';

interface DocumentsListProps {
  documents: Document[];
}

const statusMeta: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default'; icon: ReactElement }> = {
  processed: {
    label: 'Processed',
    color: 'success',
    icon: <CheckCircleRoundedIcon fontSize="small" />,
  },
  processing: {
    label: 'Processing',
    color: 'warning',
    icon: <LoopRoundedIcon fontSize="small" />,
  },
  failed: {
    label: 'Failed',
    color: 'error',
    icon: <ErrorRoundedIcon fontSize="small" />,
  },
  pending: {
    label: 'Pending',
    color: 'default',
    icon: <AccessTimeRoundedIcon fontSize="small" />,
  },
};

const DocumentsList: React.FC<DocumentsListProps> = ({ documents }) => {
  if (documents.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 4,
          py: 6,
          px: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(76,96,255,0.08), rgba(15,23,42,0.08))',
        }}
      >
        <ArticleRoundedIcon sx={{ fontSize: 48, color: 'primary.light' }} />
        <Typography variant="h6" mt={2} color="text.primary">
          No documents yet
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Upload your first PDF to unlock semantic search and summarization.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5}>
      {documents.map((doc) => {
        const uploadedAt = new Date(doc.created_at).toLocaleString();
        const source = doc.metadata?.source ?? 'Uploaded PDF';
        const status = statusMeta[doc.status] ?? statusMeta.pending;

        return (
          <Paper
            key={doc.id}
            variant="outlined"
            sx={{
              borderRadius: 4,
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 24px 70px -50px rgba(76,96,255,0.45)',
              },
            }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Chip
                icon={<PictureAsPdfRoundedIcon />}
                label="PDF"
                color="primary"
                variant="outlined"
                sx={{ borderRadius: '12px' }}
              />
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                  {doc.title}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    icon={<TodayRoundedIcon />}
                    label={uploadedAt}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<PersonRoundedIcon />}
                    label={`${doc.user_id.slice(0, 8)}…`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<LinkRoundedIcon />}
                    label={source}
                    variant="outlined"
                    size="small"
                  />
                </Stack>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                icon={status.icon}
                label={status.label}
                color={status.color}
                variant="outlined"
                sx={{ borderRadius: '999px' }}
              />

              {doc.status === 'processed' && (
                <Button
                  variant="outlined"
                  startIcon={<SearchRoundedIcon />}
                  sx={{ borderRadius: '999px' }}
                >
                  Explore
                </Button>
              )}
            </Stack>
          </Paper>
        );
      })}
      <Divider sx={{ pt: 1 }} />
    </Stack>
  );
};

export default DocumentsList;

