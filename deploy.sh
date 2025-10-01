#!/bin/bash

# DocuMind Deployment Script
# This script deploys the DocuMind backend to production

set -e

echo "🚀 Starting DocuMind deployment..."

# Check if required environment variables are set
required_vars=("SECRET_KEY" "DATABASE_URL" "SUPABASE_URL" "SUPABASE_KEY" "SUPABASE_JWT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t documind-api .

# Run database migrations
echo "🗄️ Running database migrations..."
docker run --rm \
    -e DATABASE_URL="$DATABASE_URL" \
    documind-api \
    alembic upgrade head

# Start the production services
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:8000/health; then
    echo "✅ DocuMind API is healthy and running!"
    echo "🌐 API Documentation: http://localhost:8000/api/docs"
    echo "🔍 Health Check: http://localhost:8000/health"
else
    echo "❌ Health check failed"
    exit 1
fi

echo "🎉 DocuMind deployment completed successfully!"

