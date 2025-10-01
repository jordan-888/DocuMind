#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs)
fi

if ! command -v rq >/dev/null 2>&1; then
  echo "rq is not installed. Install dependencies via 'pip install -r requirements.txt'" >&2
  exit 1
fi

echo "Starting RQ worker on queue 'documents-processing'"
rq worker documents-processing
