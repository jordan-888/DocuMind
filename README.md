# 🧠 DocuMind - AI Document Intelligence Platform

**A production-ready AI-powered document processing platform with semantic search, AI chat, and intelligent summarization.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org)
[![Material UI](https://img.shields.io/badge/Material%20UI-7-blue.svg)](https://mui.com)

---

## 🎯 Overview

DocuMind enables users to:
- 📄 **Upload & Process** PDF documents with automatic text extraction
- 🤖 **AI Chat Assistant** - Conversational interface to query documents with citations
- 📊 **AI Summarization** - RAG-powered intelligent document summarization  
- 🔐 **Secure Authentication** - Supabase-powered user management

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20.19+
- PostgreSQL with pgvector extension (for production)
- Supabase account (for authentication)

### 1. Backend Setup

```bash
# Navigate to project
cd DocuMind\ Project

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (see .env.example)
cp .env.example .env
# Edit .env with your credentials

# Start backend
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  FastAPI Backend│    │   PostgreSQL    │
│   (Vercel)      │◄──►│   (Render)      │◄──►│   (Supabase)   │
│                 │    │                 │    │                 │
│ • Material UI   │    │ • REST API      │    │ • Document Store│
│ • Supabase Auth │    │ • JWT Auth      │    │ • Vector Store │
│ • Axios Client  │    │ • ML Processing │    │ • User Data    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL + pgvector / SQLite (development)
- **Authentication**: Supabase Auth with JWT validation
- **ML/AI**: Hugging Face Transformers, Sentence Transformers
- **Processing**: PyMuPDF, NLTK
- **Deployment**: Render (Docker)

### Frontend
- **Framework**: React 19 + TypeScript
- **UI**: Material UI 7 with custom premium theme
- **Authentication**: Supabase JS Client
- **HTTP**: Axios with JWT interceptor
- **Deployment**: Vercel

---

## 📊 Features

### ✅ Core Features
- **Document Upload** - PDF processing with real-time status
- **AI Chat Assistant** - Query documents with context and citations
- **AI Summarization** - RAG-powered document summarization
- **User Authentication** - Secure Supabase authentication
- **Document Management** - View and organize uploads

### ✅ AI/ML Capabilities
- **Embeddings** - Sentence transformers (384-dimensional)
- **Vector Search** - Semantic similarity search
- **Summarization** - Extractive summarization with RAG
- **Document Processing** - PDF extraction and intelligent chunking

### ✅ User Experience
- **Modern UI** - Material UI with glassmorphism and gradients
- **Responsive Design** - Mobile-ready interface
- **Real-time Updates** - Live status tracking
- **Professional UX** - Loading states, error handling

---

## 🔐 Authentication Flow

### How It Works

1. **User logs in** via Supabase (frontend)
2. **Supabase** issues JWT access token
3. **Frontend** stores session in browser
4. **Axios interceptor** attaches token to all API requests:
   ```typescript
   Authorization: Bearer <jwt_token>
   ```
5. **Backend** validates JWT with Supabase
6. **Request succeeds** with authenticated user context

### Implementation Details

**Frontend** (`frontend/src/App.tsx`):
```typescript
// Axios interceptor gets fresh token from Supabase session
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Backend** (`app/services/auth.py`):
```python
# Strip 'Bearer ' prefix and validate with Supabase
token = credentials.credentials
if token.startswith('Bearer '):
    token = token[7:]

user_response = supabase_client.auth.get_user(token)
```

---

## 🔧 API Endpoints

### Authentication
- `POST /auth/supabase-callback` - Supabase auth callback

### Documents
- `GET /api/v1/documents` - List user's documents
- `POST /api/v1/documents/upload` - Upload PDF
- `GET /api/v1/documents/{id}` - Get document metadata
- `POST /api/v1/documents/summarize` - AI summarization

### Chat
- `POST /api/v1/chat` - Chat with documents (with citations)

### Debug (Development)
- `GET /api/debug/auth` - Debug authentication issues

### System
- `GET /health` - Health check
- `GET /docs` - API documentation (Swagger UI)

---

## 🚀 Deployment

### Environment Variables

**Backend (.env)**:
```bash
# Required
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Optional
STORAGE_PROVIDER=local  # or 'supabase'
REDIS_URL=redis://localhost:6379/0
```

**Frontend (.env.local)**:
```bash
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY` (frontend & backend)
   - **JWT Secret** → `SUPABASE_JWT_SECRET` (backend only)

### Deploy to Render (Backend)

1. Connect GitHub repository
2. Set environment variables (see above)
3. Deploy with:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploy to Vercel (Frontend)

```bash
cd frontend
npx vercel
```

Set environment variables in Vercel dashboard.

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **500 Internal Server Error on API requests**

**Symptom**: All API calls return 500 error
**Cause**: JWT authentication failure
**Solution**:
1. Check Render environment variables:
   - `SUPABASE_URL` is set correctly
   - `SUPABASE_KEY` is the **anon** key (not service_role)
   - `SUPABASE_JWT_SECRET` matches your Supabase project
2. Verify Vercel deployed latest frontend code
3. Test with debug endpoint: `GET /api/debug/auth`

#### 2. **"invalid JWT: token is malformed"**

**Symptom**: Backend logs show JWT parsing errors
**Cause**: Frontend not sending token or sending malformed token
**Solution**:
1. Check browser console for errors
2. Verify user is logged in: `supabase.auth.getSession()`
3. Ensure Vercel deployed latest frontend with Axios interceptor
4. Clear browser cache and re-login

#### 3. **File upload fails**

**Symptom**: Upload returns error or hangs
**Cause**: Database connection or storage issue
**Solution**:
1. Check `DATABASE_URL` is accessible from Render
2. For local development, use SQLite: `DATABASE_URL=sqlite:///./test.db`
3. Check Render logs for specific error
4. Verify `STORAGE_PROVIDER` is set correctly

#### 4. **Frontend build fails on Vercel**

**Symptom**: TypeScript errors during build
**Cause**: Missing props or type mismatches
**Solution**:
1. Check build logs for specific error
2. Ensure all dependencies are installed
3. Verify TypeScript version compatibility
4. Run `npm run build` locally to test

### Debug Commands

```bash
# Test authentication with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.onrender.com/api/debug/auth

# Check backend health
curl https://your-backend.onrender.com/health

# Get Supabase session token (browser console)
supabase.auth.getSession().then(s => console.log(s.data.session.access_token))
```

---

## 📚 Project Structure

```
DocuMind Project/
├── app/                    # Backend (FastAPI)
│   ├── api/               # API routes
│   │   └── routers/       # Endpoint routers
│   ├── core/              # Core configuration
│   ├── models/            # Database models
│   ├── services/          # Business logic
│   └── ml/                # ML/AI modules
├── frontend/              # Frontend (React)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── tests/                 # Backend tests
├── scripts/               # Helper scripts
├── .env.example           # Environment template
└── README.md              # This file
```

---

## 🎉 Recent Updates

### Latest Fixes (Nov 2024)

✅ **JWT Authentication Fixed**
- Added Axios interceptor to attach Supabase tokens
- Backend now strips 'Bearer ' prefix correctly
- Added debug endpoint for troubleshooting

✅ **UI Improvements**
- Removed semantic search feature
- Enhanced AI Chat with citations and suggested questions
- Improved text input boxes (multiline)
- Better error messages and logging

✅ **Backend Enhancements**
- Comprehensive error handling and logging
- SQLite support for local development
- Better token validation
- Improved document processing

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review API documentation at `/docs`
- Open an issue on GitHub

---

**Status: ✅ PRODUCTION-READY** 🚀

DocuMind is a complete, professional AI Document Intelligence platform ready for deployment and demonstration!