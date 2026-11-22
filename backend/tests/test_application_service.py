import pytest
import uuid
from services.application_service import application_service

@pytest.mark.asyncio
async def test_save_draft_and_retrieve(sample_eligible_applicant):
    app_id = f"test-app-{uuid.uuid4().hex[:8]}"

    # Save draft
    saved_id = await application_service.save_draft_or_update(
        scheme_id="nsp-pms-2026",
        scheme_title="Post-Matric Scholarship Scheme 2026",
        applicant=sample_eligible_applicant,
        app_id=app_id,
        mode="live",
        status="draft",
        eligibility_status="ELIGIBLE"
    )
    assert saved_id == app_id

    # Retrieve application
    retrieved = await application_service.get_application(app_id)
    assert retrieved is not None
    assert retrieved["id"] == app_id
    assert retrieved["applicant_name"] == sample_eligible_applicant["name"]
    assert retrieved["status"] == "draft"
    assert retrieved["scheme_id"] == "nsp-pms-2026"
    assert retrieved["reference_number"].startswith("CP-")

@pytest.mark.asyncio
async def test_update_existing_application(sample_eligible_applicant):
    app_id = f"test-app-{uuid.uuid4().hex[:8]}"

    await application_service.save_draft_or_update(
        scheme_id="nsp-pms-2026",
        scheme_title="Post-Matric Scholarship Scheme 2026",
        applicant=sample_eligible_applicant,
        app_id=app_id,
        status="draft"
    )

    # Update applicant info
    updated_applicant = dict(sample_eligible_applicant)
    updated_applicant["college_name"] = "Indian Institute of Technology Delhi"

    await application_service.save_draft_or_update(
        scheme_id="nsp-pms-2026",
        scheme_title="Post-Matric Scholarship Scheme 2026",
        applicant=updated_applicant,
        app_id=app_id,
        status="under_review"
    )

    retrieved = await application_service.get_application(app_id)
    assert retrieved["college_name"] == "Indian Institute of Technology Delhi"
    assert retrieved["status"] == "under_review"

@pytest.mark.asyncio
async def test_mark_submitted_with_receipt(sample_eligible_applicant):
    app_id = f"test-app-{uuid.uuid4().hex[:8]}"
    ref_no = f"CP-TEST-{uuid.uuid4().hex[:6].upper()}"

    await application_service.save_draft_or_update(
        scheme_id="nsp-pms-2026",
        scheme_title="Post-Matric Scholarship Scheme 2026",
        applicant=sample_eligible_applicant,
        app_id=app_id,
        status="under_review"
    )

    receipt_data = {
        "reference_number": ref_no,
        "applicant_name": sample_eligible_applicant["name"],
        "scheme_title": "Post-Matric Scholarship Scheme 2026",
        "official_portal": "https://scholarships.gov.in",
        "receipt_hash": "SHA256:abcd1234efgh5678"
    }

    await application_service.mark_submitted(
        app_id=app_id,
        reference_number=ref_no,
        receipt_data=receipt_data,
        logs=["Automated submission confirmed.", "Verifiable receipt issued."]
    )

    retrieved = await application_service.get_application(app_id)
    assert retrieved["status"] == "submitted"
    assert retrieved["reference_number"] == ref_no
    assert retrieved["receipt_data"]["receipt_hash"] == "SHA256:abcd1234efgh5678"
    assert len(retrieved["execution_logs"]) == 2

@pytest.mark.asyncio
async def test_get_nonexistent_application():
    result = await application_service.get_application("nonexistent-app-999")
    assert result is None

@pytest.mark.asyncio
async def test_list_applications():
    apps = await application_service.list_applications()
    assert isinstance(apps, list)
    assert len(apps) >= 1
