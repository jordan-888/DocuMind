// Configuration for DocuMind Frontend

const config = {
  // Supabase Configuration (Demo - using mock values)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key',
  },
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  },
  
  // App Configuration
  app: {
    name: 'DocuMind',
    version: '1.0.0',
    description: 'AI Document Intelligence Platform',
  },
};

export default config;

