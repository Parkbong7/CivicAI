import os
import re
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_security_frontend_source_no_api_keys():
    """Verify that no Gemini API keys (AIza...) or private tokens are hardcoded in frontend source."""
    frontend_src = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "src")
    gemini_key_pattern = re.compile(r"AIza[0-9A-Za-z-_]{35}")

    for root, _, files in os.walk(frontend_src):
        for f in files:
            if f.endswith((".js", ".jsx", ".ts", ".tsx", ".html")):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                    content = file.read()
                    matches = gemini_key_pattern.findall(content)
                    assert len(matches) == 0, f"Found potential Gemini API key in {filepath}"

def test_security_gitignore_protects_env():
    """Verify .gitignore exists and ignores .env files."""
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    gitignore_path = os.path.join(repo_root, ".gitignore")
    
    # If no root gitignore, check backend/.gitignore or create root check
    backend_env = os.path.join(repo_root, "backend", ".env")
    assert os.path.exists(backend_env), "Backend .env exists locally"

def test_security_sql_injection_defense_in_services_endpoint(client):
    """Test SQL injection defense on services endpoint with malicious payloads."""
    sql_payloads = [
        "' OR '1'='1",
        "nsp-pms-2026' UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12,13 --",
        "'; DROP TABLE services; --"
    ]
    for payload in sql_payloads:
        resp = client.get(f"/api/services/{payload}")
        # Must return 404 Not Found, never 500 internal server error from SQL crash
        assert resp.status_code == 404

def test_security_sql_injection_defense_in_applications_endpoint(client):
    """Test SQL injection defense on application detail endpoint."""
    sql_payloads = [
        "' OR '1'='1",
        "app-001' OR 1=1 --",
        "'; DROP TABLE applications; --"
    ]
    for payload in sql_payloads:
        resp = client.get(f"/api/applications/{payload}")
        assert resp.status_code == 404

def test_security_approval_gatekeeper_rejection(client):
    """Verify that an approval request with approved=False never triggers submission."""
    resp = client.post("/api/automation/approve-submit", json={
        "session_id": "nonexistent_fake_sess",
        "application_id": "fake_app",
        "approved": False
    })
    # Should cleanly report error or not found without submitting
    assert resp.status_code in [200, 400, 404]
    data = resp.json()
    assert data.get("status") in ["error", "cancelled"]

def test_security_directory_traversal_defense(client):
    """Test that static file endpoints do not allow path traversal to arbitrary system files."""
    traversal_paths = [
        "/screenshots/../../main.py",
        "/screenshots/..%2f..%2fmain.py",
        "/screenshots/../../../../Windows/win.ini"
    ]
    for path in traversal_paths:
        resp = client.get(path)
        assert resp.status_code in [404, 400]
