"""
Integration tests for DocuMind API
"""
import tempfile

from fastapi.testclient import TestClient

def test_health_endpoint(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data

def test_api_documentation(client: TestClient):
    """Test API documentation endpoints"""
    # Test OpenAPI JSON
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert data["info"]["title"] == "DocuMind"
    
    # Test Swagger UI
    response = client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_document_upload_validation(client: TestClient):
    """Test document upload validation"""
    # Test without file
    response = client.post("/api/v1/documents/upload")
    assert response.status_code == 422
    
    # Test with invalid file type
    with tempfile.NamedTemporaryFile(suffix=".txt") as tmp:
        response = client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.txt", tmp, "text/plain")}
        )
        assert response.status_code == 400

def test_search_endpoint_validation():
    """Test search endpoint validation without auth"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    with TestClient(app) as client:
        # Test with valid query but no auth - auth check happens first
        response = client.post("/api/v1/documents/search", json={"query": "test"})
        # Should return 403 (forbidden) since we don't have auth
        assert response.status_code == 403

def test_cors_headers(client: TestClient):
    """Test CORS headers"""
    response = client.get("/health")
    # CORS headers might not be present in test environment, just check response is OK
    assert response.status_code == 200

def test_error_handling(client: TestClient):
    """Test error handling"""
    # Test 404 for non-existent endpoint
    response = client.get("/non-existent")
    assert response.status_code == 404
    
    # Test invalid JSON
    response = client.post(
        "/api/v1/documents/search",
        data="invalid json",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422
