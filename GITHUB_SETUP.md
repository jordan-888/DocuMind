# GitHub Setup Guide

Quick guide to get your DocuMind project on GitHub.

---

## Step 1: Create .gitignore

Before committing, ensure `.gitignore` is in place to exclude sensitive files and build artifacts.

The `.gitignore` should already be created. If not, it will be generated automatically.

---

## Step 2: Initial Commit

```bash
# Check git status
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DocuMind - AI Document Intelligence Platform

- FastAPI backend with semantic search and summarization
- React + TypeScript frontend with Material UI
- PostgreSQL + pgvector for vector storage
- Supabase authentication
- Docker support
- CI/CD with GitHub Actions
- Comprehensive test suite (18 tests, 61% coverage)"
```

---

## Step 3: Create GitHub Repository

### Option A: Via GitHub Website

1. Go to [github.com](https://github.com)
2. Click **"+"** → **"New repository"**
3. Fill in:
   - **Repository name**: `documind` (or your preferred name)
   - **Description**: `AI-powered document intelligence platform with semantic search and summarization`
   - **Visibility**: Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# brew install gh

# Authenticate
gh auth login

# Create repository
gh repo create documind --public --description "AI-powered document intelligence platform" --source=. --remote=origin --push
```

---

## Step 4: Push to GitHub

If you created the repo via website (Option A):

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/documind.git

# Push code
git branch -M main
git push -u origin main
```

If you used GitHub CLI (Option B), your code is already pushed!

---

## Step 5: Verify Upload

1. Go to your repository on GitHub
2. Verify all files are present
3. Check that `.env` and other sensitive files are **NOT** visible
4. Review the README.md renders correctly

---

## Step 6: Configure Repository Settings (Optional)

### Add Topics

1. Go to repository → **About** (gear icon)
2. Add topics: `fastapi`, `react`, `typescript`, `ai`, `machine-learning`, `semantic-search`, `document-processing`, `supabase`, `pgvector`

### Enable GitHub Actions

1. Go to **Actions** tab
2. GitHub Actions should be enabled by default
3. The CI/CD workflow (`.github/workflows/ci.yml`) will run on push

### Branch Protection (Recommended for teams)

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass (CI tests)
   - Require branches to be up to date

### Add Secrets for CI/CD

If your CI needs secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `DATABASE_URL` (test database)

---

## Step 7: Create a Great README Badge Section

Add these badges to the top of your README.md:

```markdown
[![CI/CD](https://github.com/YOUR_USERNAME/documind/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/documind/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
```

---

## Common Git Commands

```bash
# Check status
git status

# View changes
git diff

# Add specific files
git add path/to/file

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature

# View commit history
git log --oneline --graph
```

---

## Troubleshooting

### "Repository not found" error
- Verify the remote URL: `git remote -v`
- Update if needed: `git remote set-url origin https://github.com/YOUR_USERNAME/documind.git`

### "Permission denied" error
- Set up SSH keys or use HTTPS with personal access token
- For HTTPS: `git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/documind.git`

### Accidentally committed secrets
1. Remove from history: `git filter-branch` or use BFG Repo-Cleaner
2. Rotate all exposed secrets immediately
3. Force push: `git push --force`

### Large files causing issues
- Use Git LFS for large files: `git lfs track "*.pdf"`
- Or add to `.gitignore` and use external storage

---

## Next Steps

After pushing to GitHub:

1. ✅ Verify CI/CD pipeline runs successfully
2. ✅ Review test coverage reports
3. ✅ Set up branch protection rules
4. ✅ Add collaborators if working in a team
5. ✅ Proceed with deployment (see DEPLOYMENT.md)

---

**Your code is now safely on GitHub!** 🚀
