-- Initialize DocuMind database
-- This script runs when the PostgreSQL container starts

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create database if it doesn't exist (handled by POSTGRES_DB)
-- The database 'documind' is created automatically by the container

-- Set up any additional configuration
-- You can add more initialization here if needed