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
  timeout: 60000, // 60 second timeout for most requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    console.log('🔐 Axios Interceptor: Getting auth token...');

    try {
      // Add timeout to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 5000)
      );

      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      const token = session?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token attached:', token.substring(0, 20) + '...');
      } else {
        console.warn('⚠️  No token found! User may not be logged in.');
      }

      console.log('📤 Request config:', {
        url: config.url,
        method: config.method,
        hasAuth: !!config.headers.Authorization,
      });
    } catch (error) {
      console.error('❌ Error in interceptor:', error);
      console.warn('⚠️  Proceeding without auth token');
    }

    return config;
  },
  (error) => {
    console.error('❌ Axios interceptor error:', error);
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

  const handleDocumentUpload = async (file: File, onProgress?: (progress: number) => void) => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 UPLOAD STARTED');
    console.log('═══════════════════════════════════════');
    console.log('📄 File:', file.name);
    console.log('📏 Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('🔗 API URL:', API_BASE_URL);
    console.log('⏱️  Timeout:', '120 seconds');

    const startTime = Date.now();

    try {
      console.log('📦 Creating FormData...');
      const formData = new FormData();
      formData.append('file', file);
      console.log('✅ FormData created');

      console.log('🌐 Sending POST request to:', `${API_BASE_URL}/api/v1/documents/upload`);
      console.log('⏳ Waiting for response...');

      const response = await apiClient.post('/api/v1/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 120 second timeout
        onUploadProgress: (progressEvent) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const loadedMB = (progressEvent.loaded / 1024 / 1024).toFixed(2);
            const totalMB = (progressEvent.total / 1024 / 1024).toFixed(2);

            console.log(`📊 Progress: ${percentCompleted}% (${loadedMB}MB / ${totalMB}MB) - ${elapsed}s elapsed`);

            if (onProgress) {
              onProgress(percentCompleted);
            }
          } else {
            console.log(`📊 Progress: ${progressEvent.loaded} bytes uploaded - ${elapsed}s elapsed`);
          }
        },
      });

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('✅ Upload completed in', totalTime, 'seconds');
      console.log('📥 Response:', response.data);

      console.log('🔄 Reloading documents list...');
      await loadDocuments();
      console.log('✅ Documents reloaded');

      console.log('═══════════════════════════════════════');
      console.log('✅ UPLOAD SUCCESS');
      console.log('═══════════════════════════════════════');

      return response.data;
    } catch (error: any) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log('═══════════════════════════════════════');
      console.log('❌ UPLOAD FAILED after', totalTime, 'seconds');
      console.log('═══════════════════════════════════════');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);

      if (error.code) {
        console.error('Error code:', error.code);
      }

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received');
        console.error('Request:', error.request);
      } else {
        console.error('Request setup error');
      }

      if (error.config) {
        console.error('Request config:', {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout,
          baseURL: error.config.baseURL,
        });
      }

      console.log('═══════════════════════════════════════');

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