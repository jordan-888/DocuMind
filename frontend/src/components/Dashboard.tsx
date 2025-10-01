import { Suspense, lazy, useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AvatarGroup from '@mui/material/AvatarGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import type { Document, SearchResponse, SummarizeResponse } from '../types';

const DocumentUpload = lazy(() => import('./DocumentUpload'));
const SearchInterface = lazy(() => import('./SearchInterface'));
const SummarizeInterface = lazy(() => import('./SummarizeInterface'));
const DocumentsList = lazy(() => import('./DocumentsList'));

interface DashboardProps {
  documents: Document[];
  searchResults: SearchResponse | null;
  summary: SummarizeResponse | null;
  onSearch: (query: string) => void;
  onSummarize: (query: string) => void;
  onUpload: (file: File) => Promise<any>;
}

const heroHighlights = [
  {
    icon: <SecurityRoundedIcon fontSize="small" />, 
    label: 'Enterprise-grade Supabase security',
  },
  {
    icon: <LayersRoundedIcon fontSize="small" />, 
    label: 'Vector-native semantic retrieval',
  },
  {
    icon: <AutoAwesomeRoundedIcon fontSize="small" />, 
    label: 'Auto-generated RAG summaries',
  },
];

const workflowHighlights = [
  {
    icon: <CodeRoundedIcon fontSize="small" />,
    title: 'Webhooks & Supabase Edge Functions',
    description: 'Wire instant actions into your existing pipelines.',
  },
  {
    icon: <LockRoundedIcon fontSize="small" />,
    title: 'Enterprise security baseline',
    description: 'SSL in transit · AES-256 at rest · audit logs.',
  },
  {
    icon: <TrendingUpRoundedIcon fontSize="small" />,
    title: 'Analytics hooks',
    description: 'Proactive monitoring for retrieval and summarization KPIs.',
  },
];

const Dashboard: React.FC<DashboardProps> = ({
  documents,
  searchResults,
  summary,
  onSearch,
  onSummarize,
  onUpload,
}) => {
  const totalDocuments = documents.length;
  const processedDocuments = useMemo(
    () => documents.filter((doc) => doc.status === 'processed').length,
    [documents],
  );
  const inProgressDocuments = useMemo(
    () => documents.filter((doc) => doc.status === 'processing').length,
    [documents],
  );
  const lastUpdatedDocument = documents[0]?.created_at ?? null;
  const latestSummaryChars = summary ? summary.summary.length : null;

  const metricCards = [
    {
      label: 'Total documents',
      value: totalDocuments,
      helper: 'Across all workspaces',
    },
    {
      label: 'Processing queue',
      value: inProgressDocuments,
      helper: 'Actively being chunked',
    },
    {
      label: 'Latest summary',
      value: latestSummaryChars ?? '—',
      helper: 'Generated insight length (chars)',
    },
    {
      label: 'Last ingestion',
      value: lastUpdatedDocument ? new Date(lastUpdatedDocument).toLocaleString() : 'Awaiting upload',
      helper: 'Timestamps synced via Supabase',
    },
  ];

  return (
    <Stack spacing={6}>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 5,
          px: { xs: 4, md: 6, lg: 8 },
          py: { xs: 6, md: 8 },
          background: 'linear-gradient(135deg, rgba(231,240,255,0.95), rgba(248,253,255,0.85))',
          boxShadow: '0 40px 120px -60px rgba(76,96,255,0.35)',
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={6} alignItems="center">
          <Stack spacing={3.5} flex={1}>
            <Chip
              icon={<BoltRoundedIcon />}
              label="AI-powered knowledge orchestration"
              color="primary"
              variant="outlined"
              sx={{ borderRadius: '999px', width: 'fit-content' }}
            />
            <Typography variant="h3" fontWeight={700} color="text.primary">
              Transform documents into instant insights
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
              Drag in regulatory filings, research decks, or lengthy manuals and let DocuMind surface the answers you need—faster than ever before.
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {heroHighlights.map((highlight) => (
                <Chip
                  key={highlight.label}
                  icon={highlight.icon}
                  label={highlight.label}
                  variant="outlined"
                  sx={{ borderRadius: '16px' }}
                />
              ))}
            </Stack>
          </Stack>

          <Box flex={{ lg: 0.9 }} width="100%">
            <Card
              sx={{
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.92)',
                boxShadow: '0 30px 80px -60px rgba(76,96,255,0.4)',
              }}
            >
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      Knowledge ingestion
                    </Typography>
                    <Chip label="Live" color="primary" variant="outlined" size="small" sx={{ borderRadius: '999px' }} />
                  </Stack>
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={78}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(99,102,241,0.15)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundImage: 'linear-gradient(135deg, #4c60ff, #06b6d4)',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" mt={1.5} display="block">
                      Ingestion queue is balancing across vector shards.
                    </Typography>
                  </Box>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 2.5,
                      backgroundColor: 'rgba(248,250,255,0.9)',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      “Our operations team reduced manual document review time by <Typography component="span" fontWeight={600} color="text.primary">58%</Typography> within the first week of adopting DocuMind.”
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" mt={3}>
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 14 } }}>
                        <Avatar alt="Nora Winters" sx={{ bgcolor: 'primary.light' }}>NW</Avatar>
                        <Avatar sx={{ bgcolor: 'secondary.light' }}>AH</Avatar>
                        <Avatar sx={{ bgcolor: 'success.light' }}>JR</Avatar>
                      </AvatarGroup>
                      <Stack spacing={0.3}>
                        <Typography variant="subtitle2" color="text.primary">
                          Nora Winters
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          VP Knowledge Ops · Apex Labs
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 2,
                    }}
                  >
                    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {processedDocuments}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Processed docs
                      </Typography>
                    </Paper>
                    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {searchResults ? searchResults.total_results : '∞'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Results surfaced
                      </Typography>
                    </Paper>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Paper>
\n      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {metricCards.map((metric) => (
          <Card key={metric.label} variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="h4" fontWeight={600} mt={2}>
                {metric.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                {metric.helper}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={4} alignItems="stretch">
        <Stack spacing={4} flex={{ xl: 1.5 }}>
          <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ height: 4, backgroundImage: 'linear-gradient(90deg, #4c60ff, #06b6d4)' }} />
            <CardContent>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                  <Stack spacing={1}>
                    <Typography variant="h5" fontWeight={600}>
                      Upload documents
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Securely ingest PDFs to automatically chunk, vectorize, and index them for downstream AI workflows.
                    </Typography>
                  </Stack>
                  <Chip icon={<CloudUploadRoundedIcon />} label="Unlimited storage tier" variant="outlined" sx={{ borderRadius: '999px', alignSelf: { xs: 'flex-start', sm: 'center' } }} />
                </Stack>
                <Suspense
                  fallback={(
                    <Stack direction="row" justifyContent="center" py={3}>
                      <CircularProgress size={28} />
                    </Stack>
                  )}
                >
                  <DocumentUpload onUpload={onUpload} />
                </Suspense>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="stretch">
            <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
              <Box sx={{ height: 4, backgroundImage: 'linear-gradient(90deg, #4c60ff, #312e81)' }} />
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={600}>
                      Semantic search
                    </Typography>
                    <Chip icon={<PsychologyRoundedIcon />} label="Vector search" variant="outlined" sx={{ borderRadius: '999px' }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Ask natural-language questions across your knowledge base.
                  </Typography>
                  <Suspense
                    fallback={(
                      <Stack direction="row" justifyContent="center" py={4}>
                        <CircularProgress size={28} />
                      </Stack>
                    )}
                  >
                    <SearchInterface onSearch={onSearch} results={searchResults} />
                  </Suspense>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
              <Box sx={{ height: 4, backgroundImage: 'linear-gradient(90deg, #06b6d4, #4c60ff)' }} />
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={600}>
                      AI summarization
                    </Typography>
                    <Chip icon={<TimelineRoundedIcon />} label="Powered by Transformers" variant="outlined" sx={{ borderRadius: '999px' }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Synthesize dense content into crisp, shareable narratives.
                  </Typography>
                  <Suspense
                    fallback={(
                      <Stack direction="row" justifyContent="center" py={4}>
                        <CircularProgress size={28} />
                      </Stack>
                    )}
                  >
                    <SummarizeInterface onSummarize={onSummarize} summary={summary} />
                  </Suspense>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>

        <Stack spacing={4} flex={{ xl: 1 }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.5}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent activity
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Track ingestion state and jump straight into a processed document.
                  </Typography>
                </Stack>
                <Chip icon={<HistoryRoundedIcon />} label="Synced" variant="outlined" size="small" sx={{ borderRadius: '999px' }} />
              </Stack>
              <Box mt={3}>
                <Suspense
                  fallback={(
                    <Stack direction="row" justifyContent="center" py={4}>
                      <CircularProgress size={28} />
                    </Stack>
                  )}
                >
                  <DocumentsList documents={documents} />
                </Suspense>
              </Box>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.1))',
            }}
          >
            <CardContent>
              <Stack spacing={2.5}>
                <Typography variant="h6" fontWeight={600}>
                  Blueprint your knowledge workflows
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pipe outputs into dashboards, automate compliance briefings, or export structured insights via our REST API.
                </Typography>
                <List disablePadding>
                  {workflowHighlights.map((highlight) => (
                    <ListItem key={highlight.title} disableGutters sx={{ alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>{highlight.icon}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={600}>{highlight.title}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{highlight.description}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Dashboard;
