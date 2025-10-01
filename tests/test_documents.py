import pytest
from fastapi import status
import time

def test_upload_document_success(client, auth_headers, test_pdf):
    """Test successful document upload."""
    with open(test_pdf, "rb") as f:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")},
            headers=auth_headers
        )
    
    assert response.status_code == status.HTTP_200_OK, response.text
    data = response.json()
    assert "id" in data
    assert data["status"] == "uploaded"
    assert data["title"] == "test.pdf"

def test_upload_invalid_file_type(client, auth_headers):
    """Test upload with invalid file type."""
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.txt", b"test content", "text/plain")},
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Only PDF files are supported" in response.json()["detail"]

def test_get_document_success(client, auth_headers, test_pdf):
    """Test getting document details."""
    # First upload a document
    with open(test_pdf, "rb") as f:
        upload_response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")},
            headers=auth_headers
        )
    
    assert upload_response.status_code == status.HTTP_200_OK, upload_response.text
    document_id = upload_response.json()["id"]
    
    # Then get its details
    response = client.get(
        f"/api/v1/documents/{document_id}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK, response.text
    data = response.json()
    assert data["id"] == document_id
    assert "title" in data

def test_get_nonexistent_document(client, auth_headers):
    """Test getting a document that doesn't exist."""
    response = client.get(
        f"/api/v1/documents/00000000-0000-0000-0000-000000000000",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Document not found" in response.json()["detail"]

def test_search_documents(client, auth_headers, test_pdf):
    """Test document search functionality."""
    # First upload a document to ensure there's something to search
    with open(test_pdf, "rb") as f:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")},
            headers=auth_headers
        )
    assert response.status_code == status.HTTP_200_OK, response.text
    
    # Give the background task a moment to process
    time.sleep(1) 
    
    # Search for content
    response = client.post(
        "/api/v1/documents/search",
        json={"query": "test document", "top_k": 5, "min_similarity": 0.1},
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK, response.text
    data = response.json()
    assert "results" in data
    assert "total_results" in data

