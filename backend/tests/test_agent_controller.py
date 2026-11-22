import pytest
from unittest.mock import MagicMock, AsyncMock
from automation.browser_service import BrowserAutomationService

@pytest.fixture
def browser_service():
    service = BrowserAutomationService()
    return service

def test_timeline_stages_initialization(browser_service):
    stages = browser_service._init_timeline_stages()
    assert len(stages) == 12
    assert stages[0]["key"] == "UNDERSTANDING_REQUEST"
    assert stages[9]["key"] == "WAITING_FOR_USER_APPROVAL"
    assert stages[11]["key"] == "GENERATING_RECEIPT"
    assert all(s["status"] == "pending" for s in stages)

def test_stage_status_progression(browser_service):
    session_id = "test_progress_session"
    browser_service.active_sessions[session_id] = {
        "session_id": session_id,
        "stages": browser_service._init_timeline_stages(),
        "current_stage": 1
    }

    # Advance to stage 5
    browser_service._update_stage(session_id, 5, "completed", "Statutory eligibility verified.")

    session = browser_service.get_session(session_id)
    stages = session["stages"]

    # Stages 1-4 should be completed
    for i in range(4):
        assert stages[i]["status"] == "completed"
    
    # Stage 5 should be completed with details
    assert stages[4]["status"] == "completed"
    assert stages[4]["details"] == "Statutory eligibility verified."

    # Stages 6-12 should be pending
    for i in range(5, 12):
        assert stages[i]["status"] == "pending"

@pytest.mark.asyncio
async def test_session_cleanup(browser_service):
    session_id = "test_cleanup_session"
    mock_browser = MagicMock()
    mock_browser.close = AsyncMock()
    mock_playwright = MagicMock()
    mock_playwright.stop = AsyncMock()

    browser_service.active_sessions[session_id] = {"session_id": session_id}
    browser_service.browsers[session_id] = mock_browser
    browser_service.playwright_instances[session_id] = mock_playwright

    await browser_service.cleanup_session(session_id)

    assert session_id not in browser_service.active_sessions
    assert session_id not in browser_service.browsers
    assert session_id not in browser_service.playwright_instances
    mock_browser.close.assert_awaited_once()
    mock_playwright.stop.assert_awaited_once()

@pytest.mark.asyncio
async def test_user_rejection_halts_submission(browser_service):
    """When user rejects or cancels approval, submission is aborted."""
    session_id = "test_reject_session"
    mock_page = MagicMock()
    browser_service.pages[session_id] = mock_page
    browser_service.active_sessions[session_id] = {
        "session_id": session_id,
        "status": "waiting_approval",
        "current_stage": 10,
        "stages": browser_service._init_timeline_stages(),
        "logs": [],
        "applicant_data": {"name": "Priya"}
    }

    result = await browser_service.approve_and_submit(
        session_id=session_id,
        approved=False
    )

    assert result["status"] == "cancelled"
    # Stage 10 should not be submitted
    assert result["stages"][10]["status"] != "completed"
