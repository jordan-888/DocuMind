import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Box, Container, Stack, Typography, CircularProgress } from '@mui/material';
import type { User, Document, SearchResponse, SummarizeResponse } from './types';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

import config from './config';
import supabase from './lib/supabaseClient';

// API configuration
const API_BASE_URL = config.api.baseUrl;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [summary, setSummary] = useState<SummarizeResponse | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
          if (session.access_token) {
            localStorage.setItem('auth_token', session.access_token);
          }
          await loadDocuments();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
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
          if (session.access_token) {
            localStorage.setItem('auth_token', session.access_token);
          }
          await loadDocuments();
        } else {
          setUser(null);
          setDocuments([]);
          localStorage.removeItem('auth_token');
          setSearchResults(null);
          setSummary(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await apiClient.get('/api/v1/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await apiClient.post('/api/v1/documents/search', { query });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
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
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '999px',
                  px: { xs: 2.5, md: 3 },
                  py: { xs: 1, md: 1.2 },
                  boxShadow: '0 4px 20px rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
                }
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontStyle: 'italic',
                    letterSpacing: 0.3,
                    fontFamily: "'Segoe Script', 'Apple Chancery', cursive",
                    textTransform: 'none',
                    color: 'text.primary',
                    fontSize: { xs: '0.75rem', md: '0.8rem' },
                  }}
                >
                  Created By -{' '}
                  <Typography
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontFamily: "'Segoe Script', 'Apple Chancery', cursive",
                      fontStyle: 'inherit',
                      fontWeight: 'inherit',
                    }}
                  >
                    Dev Jadaun
                  </Typography>
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    documents={documents}
                    searchResults={searchResults}
                    summary={summary}
                    onSearch={handleSearch}
                    onSummarize={handleSummarize}
                    onUpload={handleDocumentUpload}
                  />
                }
              />
            </Routes>
          )}
        </Container>
      </Box>
    </Router>
  );
}

export default App;