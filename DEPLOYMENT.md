# DocuMind Deployment Guide

This guide walks you through deploying DocuMind to production using Supabase (database + auth), Render/Railway (backend), and Vercel (frontend).

---

## Prerequisites

- GitHub account (for code hosting)
- Supabase account (free tier)
- Render or Railway account (free tier)
- Vercel account (free tier)

---

## Part 1: Supabase Setup (Database + Authentication)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `documind` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 1.2 Enable pgvector Extension

1. In your Supabase dashboard, go to **SQL Editor**
2. Run this SQL:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.3 Create Database Tables

1. Still in **SQL Editor**, run the contents of `create_tables.sql`:

```sql
-- Create tables for DocuMind
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR,
    storage_path VARCHAR,
    status VARCHAR DEFAULT 'uploaded',
    meta_info JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doc_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id),
    chunk_index INTEGER,
    text VARCHAR,
    embedding VECTOR(384),
    meta_info JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector index
CREATE INDEX IF NOT EXISTS ix_doc_chunks_embedding 
ON doc_chunks USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### 1.4 Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

### 1.5 Configure Storage (Optional)

If you want to store PDFs in Supabase Storage:

1. Go to **Storage** → **Create bucket**
2. Name it `documents`
3. Set policies:
   - **SELECT**: `authenticated` users can read their own files
   - **INSERT**: `authenticated` users can upload
   - **DELETE**: `authenticated` users can delete their own files

### 1.6 Collect Supabase Credentials

Go to **Settings** → **API** and copy:

- **Project URL** (e.g., `https://xxxxx.supabase.co`)
- **anon/public key** (starts with `eyJ...`)
- **service_role key** (starts with `eyJ...`) - **Keep this secret!**

Go to **Settings** → **API** → **JWT Settings** and copy:

- **JWT Secret** (used for token verification)

---

## Part 2: Backend Deployment (Render or Railway)

### Option A: Deploy to Render

#### 2.1 Push Code to GitHub

```bash
# Create .gitignore (if not already created)
# Add all files
git add .
git commit -m "Initial commit: DocuMind backend and frontend"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/documind.git
git branch -M main
git push -u origin main
```

#### 2.2 Create Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `documind-api`
   - **Environment**: `Docker`
   - **Region**: Choose closest to your Supabase region
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile`

#### 2.3 Set Environment Variables

In Render dashboard, go to **Environment** and add:

```bash
SECRET_KEY=<generate-with-openssl-rand-hex-32>
DATABASE_URL=<your-supabase-postgres-url>
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=<your-supabase-anon-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>

# Optional but recommended
REDIS_URL=<render-redis-url-if-using>
STORAGE_PROVIDER=supabase
CORS_ORIGINS=["https://your-frontend-domain.vercel.app"]
DEBUG=false
```

**To get DATABASE_URL from Supabase:**
- Go to Supabase **Settings** → **Database**
- Copy the **Connection string** (URI format)
- Replace `[YOUR-PASSWORD]` with your database password

#### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for build and deployment (~5-10 minutes)
3. Your API will be live at `https://documind-api.onrender.com`

### Option B: Deploy to Railway

#### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `documind` repository
4. Railway will auto-detect the Dockerfile

#### 2.2 Set Environment Variables

Add the same environment variables as Render (see section 2.3 above)

#### 2.3 Deploy

Railway will automatically deploy. Your API will be at `https://documind-api.railway.app`

---

## Part 3: Frontend Deployment (Vercel)

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```bash
VITE_API_URL=https://documind-api.onrender.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Your frontend will be live at `https://documind.vercel.app`

### 3.4 Update Backend CORS

Go back to your backend (Render/Railway) and update `CORS_ORIGINS`:

```bash
CORS_ORIGINS=["https://documind.vercel.app"]
```

Redeploy the backend for changes to take effect.

---

## Part 4: Post-Deployment Configuration

### 4.1 Test the Deployment

1. Visit your frontend URL
2. Sign up with a test email
3. Check Supabase **Authentication** → **Users** to see the new user
4. Upload a test PDF document
5. Try searching and summarizing

### 4.2 Configure Custom Domain (Optional)

**For Vercel (Frontend):**
1. Go to project **Settings** → **Domains**
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Follow DNS configuration instructions

**For Render (Backend):**
1. Go to service **Settings** → **Custom Domains**
2. Add your API domain (e.g., `api.yourdomain.com`)
3. Configure DNS

### 4.3 Set Up Monitoring

**Render:**
- Built-in logs and metrics available in dashboard
- Set up health check alerts

**Vercel:**
- Analytics available in dashboard
- Set up deployment notifications

**Supabase:**
- Monitor database usage in **Database** → **Usage**
- Set up database backups (Settings → Database → Backups)

---

## Part 5: Environment Variables Reference

### Backend (.env)

```bash
# Required
SECRET_KEY=<64-char-hex-string>
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=<anon-key>
SUPABASE_JWT_SECRET=<jwt-secret>

# Optional
REDIS_URL=redis://...
STORAGE_PROVIDER=supabase
CORS_ORIGINS=["https://your-frontend.vercel.app"]
DEBUG=false
VECTOR_STORE=pgvector
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## Part 6: Troubleshooting

### Backend won't start
- Check Render/Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct and database is accessible

### Frontend can't connect to backend
- Check CORS_ORIGINS includes your Vercel domain
- Verify VITE_API_URL is correct
- Check browser console for CORS errors

### Authentication not working
- Verify SUPABASE_JWT_SECRET matches Supabase dashboard
- Check Supabase Authentication is enabled
- Ensure email provider is configured

### Database connection errors
- Verify DATABASE_URL format and credentials
- Check Supabase database is running
- Ensure pgvector extension is enabled

### File uploads failing
- Check STORAGE_PROVIDER setting
- Verify Supabase Storage bucket exists and has correct policies
- Check file size limits (default 10MB)

---

## Part 7: Scaling Considerations

### Database
- Monitor Supabase usage and upgrade plan if needed
- Consider connection pooling for high traffic
- Optimize vector index parameters for your dataset size

### Backend
- Scale Render/Railway instances vertically (more RAM/CPU)
- Add Redis for caching and background jobs
- Consider horizontal scaling with load balancer

### Frontend
- Vercel automatically handles CDN and scaling
- Optimize bundle size (code splitting)
- Enable Vercel Analytics for performance monitoring

---

## Security Checklist

- [ ] All secrets stored in environment variables (never in code)
- [ ] `.env` files in `.gitignore`
- [ ] CORS configured with specific origins (not `*`)
- [ ] Supabase RLS policies configured
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Monitoring and alerts set up

---

## Next Steps

1. Set up CI/CD for automatic deployments
2. Configure database backups
3. Add monitoring and error tracking (e.g., Sentry)
4. Implement rate limiting
5. Add more comprehensive tests
6. Optimize ML model loading and caching

---

**Congratulations!** 🎉 Your DocuMind application is now live and ready for users.
