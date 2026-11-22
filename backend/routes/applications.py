import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Response
from services.application_service import application_service
from models.application import ApplicationRecord
from automation.browser_service import get_browser_executable
from playwright.async_api import async_playwright

logger = logging.getLogger("civicpilot.routes.applications")
router = APIRouter(prefix="/api/applications", tags=["Applications & Tracking"])

@router.get("")
async def list_applications():
    try:
        apps = await application_service.list_applications()
        return {"status": "success", "count": len(apps), "applications": apps}
    except Exception as e:
        logger.error(f"Error listing applications: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{app_id}")
async def get_application(app_id: str):
    try:
        app = await application_service.get_application(app_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application record not found")
        return {"status": "success", "application": app}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching application {app_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_draft_application(payload: Dict[str, Any]):
    try:
        scheme_id = payload.get("scheme_id", "nsp-pms-2026")
        scheme_title = payload.get("scheme_title", "Post-Matric Scholarship Scheme")
        applicant = payload.get("applicant", {})
        mode = payload.get("mode", "live")
        eligibility_status = payload.get("eligibility_status")
        eligibility_notes = payload.get("eligibility_notes")

        app_id = await application_service.save_draft_or_update(
            scheme_id=scheme_id,
            scheme_title=scheme_title,
            applicant=applicant,
            mode=mode,
            status="draft",
            eligibility_status=eligibility_status,
            eligibility_notes=eligibility_notes
        )
        return {"status": "success", "application_id": app_id, "message": "Draft created successfully"}
    except Exception as e:
        logger.error(f"Error creating draft application: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export-pdf")
async def export_receipt_pdf(payload: Dict[str, Any]):
    try:
        ref = payload.get("reference_number", "NSP-2026-LIVE")
        name = payload.get("applicant_name", "Student Applicant")
        college = payload.get("college_name", "Recognized Institution")
        date = payload.get("submitted_at", "21 November 2026")
        status = payload.get("status", "PROVISIONALLY_SUBMITTED")
        scheme = payload.get("scheme_title", "Post-Matric Scholarship Scheme for College Students 2026")
        dig_hash = payload.get("digital_signature_hash", "SHA256-5d746dc24933ef91")

        html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
<style>
  @page {{ size: A4; margin: 20mm; }}
  body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5; }}
  .header {{ text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }}
  .gov-title {{ font-size: 16px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; }}
  .sub {{ font-size: 12px; color: #64748b; margin-top: 2px; }}
  .badge {{ background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; margin-top: 8px; }}
  .ref-card {{ background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; }}
  .ref-label {{ font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }}
  .ref-value {{ font-size: 20px; font-family: monospace; font-weight: 800; color: #1e3a8a; margin-top: 4px; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }}
  th, td {{ padding: 10px 14px; border: 1px solid #e2e8f0; text-align: left; }}
  th {{ background: #f1f5f9; color: #475569; font-weight: 600; width: 35%; }}
  td {{ font-weight: 500; color: #0f172a; }}
  .notice {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; margin-top: 20px; font-size: 11px; color: #1e40af; }}
  .footer {{ margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }}
</style>
</head>
<body>
  <div class='header'>
    <div class='gov-title'>National Scholarship Portal &bull; Government of India</div>
    <div class='sub'>CivicPilot AI Autonomous Public Service Agent &bull; Official Submission Receipt</div>
    <div class='badge'>PROVISIONALLY SUBMITTED &amp; VERIFIED</div>
  </div>
  <div class='ref-card'>
    <div>
      <div class='ref-label'>Application Reference Number</div>
      <div class='ref-value'>{ref}</div>
    </div>
  </div>
  <table>
    <tr><th>Applicant Name</th><td>{name}</td></tr>
    <tr><th>Enrolled Institution</th><td>{college}</td></tr>
    <tr><th>Applied Scheme</th><td>{scheme}</td></tr>
    <tr><th>Submission Date &amp; Time</th><td>{date}</td></tr>
    <tr><th>Application Status</th><td><span style='color: #059669; font-weight: 700;'>&bull; {status}</span></td></tr>
    <tr><th>Verification Security Hash</th><td style='font-family: monospace; font-size: 11px;'>{dig_hash}</td></tr>
  </table>
  <div class='notice'>
    <strong>Next Steps:</strong> Your application has been logged on the Official National Scholarship Portal (scholarships.gov.in). Form is forwarded to the Institutional Nodal Officer (INO) for verification. Direct Benefit Transfer (DBT) will be credited to your linked Aadhaar bank account upon approval.
  </div>
  <div class='footer'>
    Generated automatically by CivicPilot AI &bull; Smart, Simple, Autonomous Public Service Agent &bull; Powered by Google Gemini &amp; Playwright
  </div>
</body>
</html>"""

        browser_exe = get_browser_executable()
        p = await async_playwright().start()
        browser = await p.chromium.launch(executable_path=browser_exe, headless=True)
        page = await browser.new_page()
        await page.set_content(html)
        pdf_bytes = await page.pdf(format="A4", print_background=True)
        await browser.close()
        await p.stop()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Receipt_{ref}.pdf"}
        )
    except Exception as e:
        logger.error(f"Error generating receipt PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))
