from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class ApplicantProfile(BaseModel):
    name: Optional[str] = Field(None, description="Full legal name of the applicant")
    email: Optional[str] = Field(None, description="Contact email address")
    phone: Optional[str] = Field(None, description="10-digit mobile number")
    dob: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD")
    gender: Optional[str] = Field(None, description="Gender (Male/Female/Other)")
    category: Optional[str] = Field(None, description="Social Category (General/OBC/SC/ST/EWS)")
    annual_income: Optional[float] = Field(None, description="Annual family income in INR (e.g. 180000)")
    gpa_percentage: Optional[float] = Field(None, description="Academic score, CGPA or percentage (e.g. 8.4 or 84)")
    college_name: Optional[str] = Field(None, description="Name of college or university enrolled in")
    course: Optional[str] = Field(None, description="Degree or program (e.g. B.Tech Computer Science)")
    year_of_study: Optional[str] = Field(None, description="Current academic year (e.g. 2nd Year)")
    state: Optional[str] = Field("Delhi", description="State of domicile")
    bank_name: Optional[str] = Field("State Bank of India", description="Student bank name")
    account_number: Optional[str] = Field(None, description="Bank account number")
    ifsc_code: Optional[str] = Field("SBIN0001234", description="Bank IFSC code")
    aadhaar_number: Optional[str] = Field(None, description="12-digit Aadhaar identification (demo safe)")

class EligibilityCondition(BaseModel):
    rule_name: str
    required_value: str
    actual_value: str
    status: str  # PASSED, FAILED, PENDING_INFO
    explanation: str

class EligibilityResult(BaseModel):
    is_eligible: bool
    overall_status: str  # ELIGIBLE, INELIGIBLE, NEEDS_MORE_INFO
    scheme_id: str
    scheme_title: str
    conditions: List[EligibilityCondition]
    missing_fields: List[str]
    summary_explanation: str
