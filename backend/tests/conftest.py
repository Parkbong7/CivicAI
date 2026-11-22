import os
import sys
import pytest
import aiosqlite
from unittest.mock import MagicMock, AsyncMock

# Add backend directory to path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Set test environment
os.environ["TESTING"] = "true"

@pytest.fixture(autouse=True)
def mock_gemini_client(monkeypatch):
    """Ensure Gemini external calls are cleanly mocked during tests."""
    mock_client = MagicMock()
    mock_models = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"detected_intent": "general_query", "reply": "Namaste! I can assist you with government services on Parivahan, PM-KISAN, and scholarship portals.", "extracted_profile_updates": {}}'
    mock_models.generate_content.return_value = mock_response
    mock_client.models = mock_models

    from services.ai_service import ai_service
    monkeypatch.setattr(ai_service, "client", mock_client)
    return mock_client

@pytest.fixture
def sample_eligible_applicant():
    return {
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "phone": "9876543210",
        "dob": "2004-05-15",
        "gender": "Female",
        "category": "OBC",
        "annual_income": 150000,
        "gpa_percentage": 8.5,
        "college_name": "Delhi Technological University",
        "course": "B.Tech Computer Science",
        "year_of_study": "2nd Year",
        "bank_name": "State Bank of India",
        "account_number": "123456789012",
        "ifsc_code": "SBIN0001234",
        "aadhaar_number": "1234-5678-9012"
    }

@pytest.fixture
def sample_ineligible_applicant():
    return {
        "name": "Amit Kumar",
        "email": "amit.kumar@example.com",
        "phone": "9876543211",
        "dob": "2002-08-20",
        "gender": "Male",
        "category": "General",
        "annual_income": 450000, # Exceeds 2.5L limit
        "gpa_percentage": 5.2,   # Below 6.0 CGPA
        "college_name": "Private Institute",
        "course": "B.Com",
        "year_of_study": "1st Year"
    }

@pytest.fixture
def sample_scholarship_scheme():
    return {
        "id": "nsp-pms-2026",
        "title": "Post-Matric Scholarship Scheme for College Students",
        "department": "Ministry of Education",
        "category": "Scholarship",
        "eligibility_rules": {
            "max_annual_income": 250000,
            "min_gpa": 6.0,
            "min_percentage": 55.0
        }
    }
