export interface User {
  id: string;
  email: string;
}

export interface Document {
  id: string;
  title: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  created_at: string;
  user_id: string;
  storage_path: string;
  metadata: Record<string, any>;
}

export interface SearchResult {
  chunk: {
    id: string;
    text: string;
    chunk_index: number;
    metadata: Record<string, any>;
  };
  document: Document;
  similarity_score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  execution_time: number;
}

export interface SummarizeResponse {
  summary: string;
  query?: string;
  document_ids?: string[];
  mode: string;
  model_info: {
    model_name: string;
    type: string;
    max_length: number;
    min_length: number;
  };
  processing_time: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface ChatCitation {
  document_id: string;
  chunk_id: string;
  text: string;
  page_number?: number;
  similarity_score: number;
}

export interface ChatResponse {
  answer: string;
  citations: ChatCitation[];
  processing_time: number;
}