from fastapi import status

def test_protected_route_without_token():
    """
    Test that accessing a protected route without a token fails.
    We use the /me endpoint as an example of a protected route.
    """
    from fastapi.testclient import TestClient
    from app.main import app
    
    # Create client without auth override
    with TestClient(app) as client:
        response = client.get("/api/v1/auth/me")
        assert response.status_code == status.HTTP_403_FORBIDDEN

def test_protected_route_with_valid_token(client, auth_headers):
    """
    Test that accessing a protected route with a (mocked) valid token succeeds.
    """
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
