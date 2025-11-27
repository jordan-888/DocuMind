import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Box, Container, Stack, Typography, CircularProgress } from '@mui/material';
import type { User, Document, SummarizeResponse } from './types';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

import config from './config';
import supabase from './lib/supabaseClient';

// API configuration
const API_BASE_URL = config.api.baseUrl;

// Create axios instance with timeout
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor - simplified to avoid async issues
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting session for API request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [summary, setSummary] = useState<SummarizeResponse | null>(null);

  useEffect(() => {
    // Failsafe: Force loading to stop after 10 seconds no matter what
    const loadingTimeout = setTimeout(() => {
      console.warn('Loading timeout reached, forcing loading to stop');
      setLoading(false);
    }, 10000);

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          // Load documents with error handling to prevent infinite loading
          try {
            await loadDocuments();
          } catch (docError) {
            console.error('Error loading documents:', docError);
            // Don't block the app if documents fail to load
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        // Always set loading to false, even if there's an error
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          // Load documents with error handling
          try {
            await loadDocuments();
          } catch (docError) {
            console.error('Error loading documents on auth change:', docError);
          }
        } else {
          setUser(null);
          setDocuments([]);
          setSummary(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await apiClient.get('/api/v1/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };



  const handleSummarize = async (query: string) => {
    try {
      const response = await apiClient.post('/api/v1/documents/summarize', {
        query,
        mode: 'multi',
        max_length: 200,
        min_length: 50,
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Summarization failed:', error);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/v1/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await loadDocuments();
      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7ff 0%, #fafbff 50%, #ffffff 100%)',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Loading DocuMind…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Router>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7ff 0%, #fafbff 50%, #ffffff 100%)',
        }}
      >
        <Header user={user} />
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
          {!user ? (
            <Stack
              spacing={{ xs: 4, md: 6 }}
              sx={{
                position: 'relative',
                minHeight: { xs: '70vh', md: '75vh' },
                pb: { xs: 6, md: 8 },
              }}
            >
              <Stack alignItems="center" justifyContent="center" flexGrow={1}>
                <Box width={{ xs: '100%', sm: '90%', md: '75%', lg: '65%' }}>
                  <Auth />
                </Box>
              </Stack>

            </Stack>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    documents={documents}
                    summary={summary}
                    onSummarize={handleSummarize}
                    onUpload={handleDocumentUpload}
                  />
                }
              />
            </Routes>
          )}
        </Container>
      </Box >
    </Router >
  );
}

export default App;