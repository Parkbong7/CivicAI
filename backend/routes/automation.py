import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from models.application import AutomationStartRequest, AutomationApprovalRequest, AutomationStatusResponse
from automation.browser_service import browser_automation_service, FILE_PORTAL_URL
from services.application_service import application_service

logger = logging.getLogger("civicpilot.routes.automation")
router = APIRouter(prefix="/api/automation", tags=["Autonomous Browser Agent"])

@router.post("/start-demo")
async def start_demo_automation(req: AutomationStartRequest):
    """
    Launches Playwright autonomous agent, opens demo scholarship portal,
    populates form fields autonomously, validates data, and pauses at WAITING_FOR_USER_APPROVAL.
    """
    try:
        session_id = req.session_id or "sess_live"
        
        # Save draft application in DB
        app_id = await application_service.save_draft_or_update(
            scheme_id=req.scheme_id,
            scheme_title="Post-Matric Scholarship Scheme for College Students 2026",
            applicant=req.applicant_data,
            mode=req.mode or "live",
            status="under_review",
            eligibility_status="ELIGIBLE"
        )

        session = await browser_automation_service.start_demo_automation(
            session_id=session_id,
            applicant_data=req.applicant_data,
            portal_url=FILE_PORTAL_URL,
            headless=req.headless
        )

        session["application_id"] = app_id
        return {
            "status": "success",
            "session_id": session_id,
            "application_id": app_id,
            "message": "Playwright autonomous browser agent initiated."
        }
    except Exception as e:
        logger.error(f"Error starting demo automation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_automation_status(session_id: str = "sess_live"):
    """
    Returns live automation state, timeline stages (1-12),
    current screenshot, action logs, and preview data.
    """
    session = browser_automation_service.get_session(session_id)
    # If exact session_id not found, fallback to the latest active session so state is never lost
    if not session and browser_automation_service.active_sessions:
        session = next(iter(browser_automation_service.active_sessions.values()))

    if not session:
        return {
            "session_id": session_id,
            "status": "idle",
            "current_stage": 1,
            "current_url": None,
            "active_field": None,
            "screenshot_url": None,
            "stages": browser_automation_service._init_timeline_stages(),
            "logs": ["Agent ready. Awaiting citizen command to initiate workflow."],
            "preview_data": None,
            "reference_number": None,
            "receipt": None,
            "error": None
        }

    return session

@router.post("/approve-submit")
async def approve_and_submit_application(req: AutomationApprovalRequest):
    """
    Citizen explicitly reviews and approves application.
    Autonomous agent clicks final submission on demo portal, reads reference number, and issues receipt.
    """
    try:
        session_id = req.session_id or "sess_live"
        session = await browser_automation_service.approve_and_submit(
            session_id=session_id,
            approved=req.approved,
            edited_data=req.edited_data
        )

        if session.get("reference_number") and session.get("receipt"):
            app_id = req.application_id or session.get("application_id")
            if app_id:
                await application_service.mark_submitted(
                    app_id=app_id,
                    reference_number=session["reference_number"],
                    receipt_data=session["receipt"],
                    logs=session.get("logs")
                )

        return session
    except Exception as e:
        logger.error(f"Error during approval/submission: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
