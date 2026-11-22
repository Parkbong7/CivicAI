import os
import pytest
import asyncio
from playwright.async_api import async_playwright
from automation.browser_service import (
    browser_automation_service,
    FILE_PORTAL_URL,
    STATIC_PORTAL_PATH,
    get_browser_executable
)

@pytest.mark.asyncio
async def test_demo_portal_file_exists():
    assert os.path.exists(STATIC_PORTAL_PATH), f"Demo portal file missing at {STATIC_PORTAL_PATH}"

@pytest.mark.asyncio
async def test_playwright_launch_and_form_interaction():
    """Verify actual Playwright browser automation against the local demo portal."""
    browser_exe = get_browser_executable()
    async with async_playwright() as p:
        browser = None
        if browser_exe:
            try:
                browser = await p.chromium.launch(executable_path=browser_exe, headless=True)
            except Exception:
                pass
        if not browser:
            browser = await p.chromium.launch(headless=True)

        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        # 1. Navigate to demo portal
        await page.goto(FILE_PORTAL_URL, wait_until="domcontentloaded")
        title = await page.title()
        assert len(title) > 0

        # 2. Verify all statutory input fields exist
        required_selectors = [
            "#applicant_name",
            "#applicant_email",
            "#applicant_phone",
            "#applicant_dob",
            "#gender",
            "#category",
            "#college_name",
            "#course",
            "#year_of_study",
            "#annual_income",
            "#gpa_percentage",
            "#bank_name",
            "#account_number",
            "#ifsc_code",
            "#declaration_checkbox"
        ]
        for sel in required_selectors:
            el = await page.query_selector(sel)
            assert el is not None, f"Selector {sel} not found on demo portal page"

        # 3. Enter applicant details
        await page.fill("#applicant_name", "Priya Sharma")
        await page.fill("#applicant_email", "priya.sharma@example.com")
        await page.fill("#applicant_phone", "9876543210")
        await page.select_option("#gender", "Female")
        await page.select_option("#category", "OBC")
        await page.fill("#college_name", "Delhi Technological University")
        await page.fill("#course", "B.Tech Computer Science")
        await page.select_option("#year_of_study", "2nd Year")
        await page.fill("#annual_income", "150000")
        await page.fill("#gpa_percentage", "8.5")
        await page.check("#declaration_checkbox")

        # 4. Verify input values
        assert await page.input_value("#applicant_name") == "Priya Sharma"
        assert await page.input_value("#annual_income") == "150000"
        assert await page.is_checked("#declaration_checkbox") is True

        # 5. Capture screenshot
        screenshot_bytes = await page.screenshot(type="jpeg", quality=60)
        assert len(screenshot_bytes) > 1000

        await browser.close()

@pytest.mark.asyncio
async def test_full_autonomous_agent_workflow():
    """Test full browser service execution: start -> fill -> pause at gatekeeper -> approve -> complete."""
    session_id = "test_pw_workflow_sess"
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

    # Start automation
    session = await browser_automation_service.start_demo_automation(
        session_id=session_id,
        applicant_data=applicant,
        portal_url=FILE_PORTAL_URL,
        headless=True
    )

    # Wait for the workflow task to reach waiting_approval
    for _ in range(60):
        await asyncio.sleep(0.3)
        curr = browser_automation_service.get_session(session_id)
        if curr and curr.get("status") in ["waiting_approval", "failed"]:
            break

    curr = browser_automation_service.get_session(session_id)
    assert curr is not None
    assert curr.get("status") == "waiting_approval", f"Expected waiting_approval, got {curr.get('status')} error: {curr.get('error')}"
    assert curr.get("current_stage") == 10
    assert curr.get("preview_data") is not None
    assert curr["preview_data"]["name"] == "Priya Sharma"
    assert curr.get("screenshot_url") is not None

    # Step 2: Citizen Approves Submission
    res = await browser_automation_service.approve_and_submit(
        session_id=session_id,
        approved=True
    )

    assert res.get("status") == "completed"
    assert res.get("reference_number") is not None
    assert res.get("reference_number").startswith("NSP-")
    assert res.get("receipt") is not None
    assert res["receipt"]["status"] == "OFFICIALLY_SUBMITTED"

    # Cleanup
    await browser_automation_service.cleanup_session(session_id)
