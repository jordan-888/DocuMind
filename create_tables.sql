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
