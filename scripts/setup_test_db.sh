#!/bin/bash

DB_USER="Dev"
TEST_DB_NAME="test_documind"

echo "Setting up test database: $TEST_DB_NAME"

# Connect to the default 'postgres' database to drop/create the test DB
psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB_NAME;"
psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $TEST_DB_NAME;"

# Connect to the new test DB to add the extension
psql -U "$DB_USER" -d $TEST_DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "Test database setup complete."