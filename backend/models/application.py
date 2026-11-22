from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .applicant import ApplicantProfile, EligibilityResult

class TimelineStage(BaseModel):
    stage_id: int
    key: str
    title: str
    description: str
    status: str = "pending"  # pending, running, completed, failed
    timestamp: Optional[str] = None
    details: Optional[str] = None

class ApplicationRecord(BaseModel):
    id: str
    reference_number: Optional[str] = None
    scheme_id: str
    scheme_title: str
    mode: str = "live"  # live or demo
    applicant: ApplicantProfile
    status: str = "draft"  # draft, waiting_approval, submitted, approved
    eligibility_status: Optional[str] = None
    eligibility_notes: Optional[str] = None
    created_at: Optional[str] = None
    submitted_at: Optional[str] = None
    receipt_data: Optional[Dict[str, Any]] = None
    execution_logs: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "sess_live"
    current_profile: Optional[Dict[str, Any]] = None
    selected_scheme_id: Optional[str] = None
    mode: Optional[str] = "live"
    history: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    reply: str
    updated_profile: Dict[str, Any]
    detected_intent: str
    recommended_schemes: List[Dict[str, Any]]
    eligibility_evaluation: Optional[EligibilityResult] = None
    missing_fields: List[str]
    ready_for_automation: bool
    suggested_action: Optional[str] = None
    timeline_current_stage: Optional[int] = 1
    detected_language: Optional[str] = "English"
    language_code: Optional[str] = "en"

class AutomationStartRequest(BaseModel):
    scheme_id: str
    applicant_data: Dict[str, Any]
    mode: str = "live"  # "demo" or "live"
    headless: bool = True
    session_id: Optional[str] = "sess_live"

class AutomationApprovalRequest(BaseModel):
    session_id: str = "sess_live"
    application_id: Optional[str] = None
    approved: bool = True
    edited_data: Optional[Dict[str, Any]] = None

class AutomationStatusResponse(BaseModel):
    session_id: str
    status: str  # idle, running, waiting_approval, completed, failed
    current_stage: int
    current_url: Optional[str] = None
    active_field: Optional[str] = None
    screenshot_url: Optional[str] = None
    stages: List[TimelineStage]
    logs: List[str]
    preview_data: Optional[Dict[str, Any]] = None
    reference_number: Optional[str] = None
    receipt: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
