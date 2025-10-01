# 🔑 Deployment Credentials Checklist

**IMPORTANT**: This file is for your reference only. DO NOT commit this with real values!

---

## 📋 Supabase Credentials

Get these from Supabase Dashboard → Settings → API

```bash
# Project URL (from Settings → API)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon/Public Key (from Settings → API → Project API keys → anon public)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (from Settings → API → Project API keys → service_role)
# ⚠️ KEEP THIS SECRET - Backend only!
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (from Settings → API → JWT Settings)
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters

# Database Password (the one you set when creating the project)
DATABASE_PASSWORD=YourDatabasePassword123

# Database URL (from Settings → Database → Connection string → URI)
# Format: postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
# If password has special chars, percent-encode them!
DATABASE_URL=postgresql://postgres:YourEncodedPassword@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## 🔐 Backend Secrets

```bash
# Generate with: openssl rand -hex 32
SECRET_KEY=your-64-character-hex-string-here
```

**Generate now:**
```bash
openssl rand -hex 32
```

---

## 🌐 Deployment URLs

Fill these in after deployment:

```bash
# Backend API URL (from Render/Railway after deployment)
BACKEND_URL=https://documind-api.onrender.com

# Frontend URL (from Vercel after deployment)
FRONTEND_URL=https://documind.vercel.app
```

---

## ✅ Next Steps

### 1. Run SQL Setup in Supabase
- Go to Supabase Dashboard → SQL Editor
- Copy and paste contents of `supabase_setup.sql`
- Click "Run"
- Verify tables are created

### 2. Deploy Backend (Render)
Use these environment variables:

```bash
SECRET_KEY=<from-openssl-command-above>
DATABASE_URL=<from-supabase-database-settings>
SUPABASE_URL=<from-supabase-api-settings>
SUPABASE_KEY=<anon-key-from-supabase>
SUPABASE_JWT_SECRET=<from-supabase-jwt-settings>
DEBUG=false
CORS_ORIGINS=["https://documind.vercel.app"]
STORAGE_PROVIDER=supabase
```

### 3. Deploy Frontend (Vercel)
Use these environment variables:

```bash
VITE_API_URL=<backend-url-from-render>
VITE_SUPABASE_URL=<from-supabase-api-settings>
VITE_SUPABASE_ANON_KEY=<anon-key-from-supabase>
```

---

## 🔍 Where to Find Each Credential

| Credential | Location in Supabase Dashboard |
|------------|-------------------------------|
| Project URL | Settings → API → Project URL |
| Anon Key | Settings → API → Project API keys → `anon` `public` |
| Service Key | Settings → API → Project API keys → `service_role` |
| JWT Secret | Settings → API → JWT Settings → JWT Secret |
| Database URL | Settings → Database → Connection string → URI |
| Database Password | (You set this when creating the project) |

---

## ⚠️ Security Reminders

- ✅ Never commit this file with real values
- ✅ Use environment variables in hosting platforms
- ✅ Keep `service_role` key backend-only
- ✅ Only use `anon` key in frontend
- ✅ Percent-encode special characters in DATABASE_URL password
- ✅ Generate a new SECRET_KEY for production

---

**Ready to deploy?** Follow DEPLOYMENT.md step by step!
