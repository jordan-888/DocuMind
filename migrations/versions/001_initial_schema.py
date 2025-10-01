"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2023-09-25 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector;')
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.UniqueConstraint('email')
    )

    # Create documents table
    op.create_table(
        'documents',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('storage_path', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='uploaded'),
        sa.Column('metadata', JSON),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'))
    )

    # Create doc_chunks table
    op.create_table(
        'doc_chunks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('document_id', UUID(as_uuid=True), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('embedding', Vector(384)),  # Dimension for all-MiniLM-L6-v2
        sa.Column('metadata', JSON),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'))
    )

    # Create indexes
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_documents_user_id', 'documents', ['user_id'])
    op.create_index('ix_doc_chunks_document_id', 'doc_chunks', ['document_id'])
    
    # Create vector similarity index
    op.execute(
        'CREATE INDEX ix_doc_chunks_embedding ON doc_chunks '
        'USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);'
    )

def downgrade() -> None:
    op.drop_index('ix_doc_chunks_embedding', table_name='doc_chunks')
    op.drop_index('ix_doc_chunks_document_id', table_name='doc_chunks')
    op.drop_index('ix_documents_user_id', table_name='documents')
    op.drop_index('ix_users_email', table_name='users')
    
    op.drop_table('doc_chunks')
    op.drop_table('documents')
    op.drop_table('users')
    
    op.execute('DROP EXTENSION IF EXISTS vector;')