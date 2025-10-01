from fastapi import status

def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"

def test_upload_document(client, auth_headers, test_pdf):
    """Test document upload endpoint."""
    with open(test_pdf, "rb") as f:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")},
            headers=auth_headers
        )
    
    assert response.status_code == status.HTTP_200_OK, response.text
    data = response.json()
    assert data["title"] == "test.pdf"
    assert data["status"] == "uploaded"
    assert "id" in data

def test_get_document(client, auth_headers, test_pdf):
    """Test getting document details endpoint."""
    # First upload a document
    with open(test_pdf, "rb") as f:
        upload_response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")},
            headers=auth_headers
        )
    
    assert upload_response.status_code == status.HTTP_200_OK, upload_response.text
    document_id = upload_response.json()["id"]
    
    # Then try to retrieve it
    response = client.get(
        f"/api/v1/documents/{document_id}",
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK, response.text
    data = response.json()
    assert data["id"] == document_id
    assert "title" in data

def test_search_documents(client, auth_headers):
    """Test document search endpoint."""
    query = {
        "query": "test search",
        "top_k": 5,
        "min_similarity": 0.1
    }
    response = client.post(
        "/api/v1/documents/search",
        json=query,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK, response.text
    data = response.json()
    assert "results" in data

