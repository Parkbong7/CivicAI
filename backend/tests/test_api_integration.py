import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_api_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CivicPilot AI" in data["service"]
    assert "SQLite" in data["database"]

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CivicPilot AI"

def test_demo_portal_static_route(client):
    response = client.get("/demo-portal")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")
    assert "Scholarship" in response.text or "Portal" in response.text

def test_cors_headers_present(client):
    response = client.options("/api/health", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET"
    })
    # CORS middleware echoes the allowed origin
    assert response.headers.get("access-control-allow-origin") in ["http://localhost:5173", "*"]

def test_list_government_services(client):
    response = client.get("/api/services")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    services = data.get("services", [])
    assert len(services) >= 4
    service_ids = [s["id"] for s in services]
    assert "nsp-pms-2026" in service_ids

def test_get_specific_service(client):
    response = client.get("/api/services/nsp-pms-2026")
    assert response.status_code == 200
    data = response.json()
    service = data.get("service", {})
    assert service["id"] == "nsp-pms-2026"
    assert "Post-Matric Scholarship" in service["title"]
    assert "eligibility_rules" in service

def test_get_nonexistent_service_returns_404(client):
    response = client.get("/api/services/nonexistent-service-xyz")
    assert response.status_code == 404

def test_chat_endpoint_valid_request(client):
    payload = {
        "message": "I am Priya, studying at DTU, family income is 1.5 Lakhs.",
        "current_profile": {},
        "selected_scheme_id": "nsp-pms-2026"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "updated_profile" in data
    assert "recommended_schemes" in data

def test_chat_endpoint_invalid_payload_returns_422(client):
    response = client.post("/api/chat", json={"invalid_field": 123})
    assert response.status_code == 422

def test_automation_status_endpoint(client):
    response = client.get("/api/automation/status?session_id=sess_test")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "stages" in data
    assert len(data["stages"]) == 12

def test_list_applications_endpoint(client):
    response = client.get("/api/applications")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data.get("applications"), list)

def test_auth_login_validation_error(client):
    # Missing password
    response = client.post("/api/auth/login", json={"email": "citizen@example.com"})
    assert response.status_code == 422
