import os
import pytest
import asyncio
import uuid
from fastapi.testclient import TestClient
from main import app
from services.eligibility_service import eligibility_service
from services.application_service import application_service
from automation.browser_service import browser_automation_service, FILE_PORTAL_URL

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.mark.asyncio
async def test_e2e_tc1_successful_scholarship_application(client):
    """
    TEST CASE 1: Successful Scholarship Application
    Citizen requests assistance -> details provided -> eligible -> automation launched ->
    paused at approval -> approved -> submitted -> appears in applications tracking.
    """
    session_id = f"sess_e2e_tc1_{uuid.uuid4().hex[:6]}"
    applicant = {
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

    # 1. Chat understanding
    chat_resp = client.post("/api/chat", json={
        "message": "I want to apply for Post-Matric Scholarship. I study at DTU, income 1.5 Lakhs.",
        "current_profile": applicant,
        "selected_scheme_id": "nsp-pms-2026"
    })
    assert chat_resp.status_code == 200

    # 2. Eligibility Evaluation
    scheme = {
        "id": "nsp-pms-2026",
        "title": "Post-Matric Scholarship Scheme for College Students",
        "eligibility_rules": {"max_annual_income": 250000, "min_gpa": 6.0}
    }
    eval_result = eligibility_service.evaluate(applicant, scheme)
    assert eval_result.is_eligible is True
    assert eval_result.overall_status == "ELIGIBLE"

    # 3. Autonomous Browser Agent Start
    start_resp = client.post("/api/automation/start-demo", json={
        "session_id": session_id,
        "scheme_id": "nsp-pms-2026",
        "applicant_data": applicant,
        "headless": True,
        "mode": "live"
    })
    assert start_resp.status_code == 200
    app_id = start_resp.json()["application_id"]

    # 4. Wait for browser agent to pause at WAITING_FOR_USER_APPROVAL
    for _ in range(100):
        await asyncio.sleep(0.3)
        st = browser_automation_service.get_session(session_id)
        if st and st.get("status") in ["waiting_approval", "failed"]:
            break

    session_state = browser_automation_service.get_session(session_id)
    assert session_state["status"] == "waiting_approval"
    assert session_state["current_stage"] == 10

    # 5. Citizen reviews and approves
    approve_resp = client.post("/api/automation/approve-submit", json={
        "session_id": session_id,
        "application_id": app_id,
        "approved": True
    })
    assert approve_resp.status_code == 200
    approval_data = approve_resp.json()
    assert approval_data["status"] in ["completed", "success"]
    ref_no = approval_data["reference_number"]
    assert ref_no.startswith("NSP-")

    # 6. Verify record appears in Applications Tracking
    app_record = await application_service.get_application(app_id)
    assert app_record is not None
    assert app_record["status"] == "submitted"
    assert app_record["reference_number"] == ref_no

    # Cleanup
    await browser_automation_service.cleanup_session(session_id)

def test_e2e_tc2_ineligible_applicant():
    """
    TEST CASE 2: Ineligible Applicant
    Income exceeds ceiling (> ₹2.5L) or CGPA < 6.0.
    Eligibility engine must reject and block submission.
    """
    ineligible_applicant = {
        "name": "Amit Kumar",
        "annual_income": 500000, # Exceeds 2.5L
        "gpa_percentage": 5.4,   # Below 6.0
        "college_name": "Private College"
    }
    scheme = {
        "id": "nsp-pms-2026",
        "title": "Post-Matric Scholarship Scheme",
        "eligibility_rules": {"max_annual_income": 250000, "min_gpa": 6.0}
    }

    eval_result = eligibility_service.evaluate(ineligible_applicant, scheme)
    assert eval_result.is_eligible is False
    assert eval_result.overall_status == "INELIGIBLE"
    failed_rules = [c.rule_name for c in eval_result.conditions if c.status == "FAILED"]
    assert "Annual Family Income Ceiling" in failed_rules

def test_e2e_tc3_missing_information(client):
    """
    TEST CASE 3: Missing Information
    Citizen provides name but no income or marks.
    Engine detects missing parameters and prompts follow-up questions.
    """
    incomplete_applicant = {
        "name": "Rahul Verma",
        "college_name": "Delhi Technological University"
    }
    scheme = {
        "id": "nsp-pms-2026",
        "title": "Post-Matric Scholarship Scheme",
        "eligibility_rules": {"max_annual_income": 250000, "min_gpa": 6.0}
    }

    eval_result = eligibility_service.evaluate(incomplete_applicant, scheme)
    assert eval_result.is_eligible is False
    assert eval_result.overall_status == "NEEDS_MORE_INFO"
    assert "annual_income" in eval_result.missing_fields
    assert "gpa_percentage" in eval_result.missing_fields

@pytest.mark.asyncio
async def test_e2e_tc4_user_rejects_submission(client):
    """
    TEST CASE 4: User Rejects Submission
    Browser agent pauses at preview -> citizen clicks Cancel/Reject ->
    Workflow halts, status marked 'cancelled', NO final submission made.
    """
    session_id = f"sess_e2e_tc4_{uuid.uuid4().hex[:6]}"
    applicant = {
        "name": "Priya Sharma",
        "annual_income": 150000,
        "gpa_percentage": 8.5
    }

    start_resp = client.post("/api/automation/start-demo", json={
        "session_id": session_id,
        "scheme_id": "nsp-pms-2026",
        "applicant_data": applicant,
        "headless": True
    })
    app_id = start_resp.json()["application_id"]

    for _ in range(100):
        await asyncio.sleep(0.3)
        st = browser_automation_service.get_session(session_id)
        if st and st.get("status") in ["waiting_approval", "failed"]:
            break

    # Citizen explicitly REJECTS
    reject_resp = client.post("/api/automation/approve-submit", json={
        "session_id": session_id,
        "application_id": app_id,
        "approved": False
    })
    assert reject_resp.status_code == 200
    res_data = reject_resp.json()
    assert res_data["status"] == "cancelled"

    # Application in DB should NOT be marked submitted
    app_record = await application_service.get_application(app_id)
    assert app_record["status"] != "submitted"

    await browser_automation_service.cleanup_session(session_id)

@pytest.mark.asyncio
async def test_e2e_tc5_browser_failure_handling():
    """
    TEST CASE 5: Browser Failure & Recovery
    Simulate navigation to unreachable portal -> system gracefully handles error and logs failure.
    """
    session_id = f"sess_e2e_tc5_{uuid.uuid4().hex[:6]}"
    
    # Intentionally bad URL that does not exist and won't resolve
    res = await browser_automation_service.start_demo_automation(
        session_id=session_id,
        applicant_data={"name": "Test Applicant"},
        portal_url="http://invalid.nonexistent.domain.test:9999/broken",
        headless=True
    )
    assert res is not None

    # Wait for execution attempt
    for _ in range(30):
        await asyncio.sleep(0.3)
        sess = browser_automation_service.get_session(session_id)
        if sess and sess.get("status") in ["waiting_approval", "failed"]:
            break

    sess = browser_automation_service.get_session(session_id)
    # The browser service either recovered to fallback mirror or logged error safely without crashing
    assert sess is not None
    assert sess.get("status") in ["waiting_approval", "failed"]
    await browser_automation_service.cleanup_session(session_id)

@pytest.mark.asyncio
async def test_e2e_tc6_application_tracking_persistence():
    """
    TEST CASE 6: Application Tracking Persistence
    Save application to SQLite -> query -> verify fields persist accurately.
    """
    test_id = f"app-tracking-{uuid.uuid4().hex[:8]}"
    ref_no = f"CP-PERSIST-{uuid.uuid4().hex[:6].upper()}"

    await application_service.save_draft_or_update(
        scheme_id="morth-dl-renewal-2026",
        scheme_title="Driving Licence Renewal (Parivahan)",
        applicant={"name": "Ananya Sen", "college_name": "Jadavpur University"},
        app_id=test_id,
        mode="live",
        status="under_review"
    )

    receipt = {
        "reference_number": ref_no,
        "applicant_name": "Ananya Sen",
        "scheme_title": "Driving Licence Renewal",
        "submitted_at": "22 November 2026, 03:00 PM"
    }

    await application_service.mark_submitted(
        app_id=test_id,
        reference_number=ref_no,
        receipt_data=receipt,
        logs=["Autonomous DL check completed."]
    )

    # Query from DB
    persisted = await application_service.get_application(test_id)
    assert persisted is not None
    assert persisted["id"] == test_id
    assert persisted["reference_number"] == ref_no
    assert persisted["status"] == "submitted"
    assert persisted["receipt_data"]["reference_number"] == ref_no
    assert len(persisted["execution_logs"]) == 1
