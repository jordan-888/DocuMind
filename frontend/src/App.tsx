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
          background: 'linear-gradient(180deg, #eef2ff 0%, #f5f7ff 60%, #ffffff 100%)',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">
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
          background: 'linear-gradient(180deg, #eef2ff 0%, #f8fbff 40%, #ffffff 100%)',
        }}
      >
        <Header user={user} />
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, px: { xs: 3, md: 4 } }}>
          {!user ? (
            <Stack alignItems="center" justifyContent="center">
              <Box width={{ xs: '100%', sm: '85%', md: '70%' }}>
                <Auth />
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
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 32 },
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '999px',
            px: { xs: 3, md: 3.75 },
            py: { xs: 1, md: 1.15 },
            boxShadow: '0 20px 44px -26px rgba(76,96,255,0.6)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(76,96,255,0.16)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: (theme) => theme.zIndex.tooltip + 1,
            pointerEvents: 'none',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontStyle: 'italic',
              letterSpacing: 0.6,
              fontFamily: "'Segoe Script', 'Apple Chancery', cursive",
              textTransform: 'none',
              px: 0.5,
              color: 'text.primary',
            }}
          >
            Created By -{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Dev Jadaun
            </Box>
          </Typography>
        </Box>
      </Box>
    </Router>
  );
}

export default App;