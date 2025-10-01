#!/usr/bin/env bash
set -euo pipefail

# Resolve project root (one level up from this script directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Optional virtual environment activation
VENV_PATH="${PROJECT_ROOT}/.venv/bin/activate"
if [[ -z "${VIRTUAL_ENV:-}" && -f "${VENV_PATH}" ]]; then
  echo "Activating virtual environment at ${VENV_PATH}" >&2
  # shellcheck disable=SC1090
  source "${VENV_PATH}"
fi

# Sensible defaults for local development (set first)
export SECRET_KEY=${SECRET_KEY:-"dev-secret-key"}
export DATABASE_URL=${DATABASE_URL:-"postgresql://Dev@localhost:5432/documind"}
export SUPABASE_URL=${SUPABASE_URL:-"http://localhost"}
export SUPABASE_KEY=${SUPABASE_KEY:-"test"}
export SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET:-"test"}
export REDIS_URL=${REDIS_URL:-"redis://localhost:6379/0"}
export CORS_ORIGINS=${CORS_ORIGINS:-'["http://localhost:5173"]'}

# Skip .env loading for now - use script defaults only
echo "Using script defaults (skipping .env to avoid CORS_ORIGINS issues)" >&2

# Ensure upload directory exists
UPLOAD_DIR=${UPLOAD_DIR:-"${PROJECT_ROOT}/data/uploads"}
mkdir -p "${UPLOAD_DIR}"
export UPLOAD_DIR

# Allow overriding host/port via env vars
HOST=${HOST:-"0.0.0.0"}
PORT=${PORT:-8000}
RELOAD=${RELOAD:-true}

cd "${PROJECT_ROOT}"

# Set PYTHONPATH to include project root
export PYTHONPATH="${PROJECT_ROOT}:${PYTHONPATH:-}"

echo "Starting DocuMind backend on http://${HOST}:${PORT}" >&2
echo "API docs will be available at http://${HOST}:${PORT}/docs" >&2

# Run the FastAPI application with uvicorn
if [[ "${RELOAD}" == "true" ]]; then
  exec python -m uvicorn app.main:app --reload --host "${HOST}" --port "${PORT}"
else
  exec python -m uvicorn app.main:app --host "${HOST}" --port "${PORT}"
fi
