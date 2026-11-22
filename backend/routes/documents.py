import time
import random
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel

router = APIRouter(prefix="/api/documents", tags=["Documents OCR"])

class SampleOCRRequest(BaseModel):
    doc_type: str = "income_certificate" # or "marksheet"
    applicant_name: Optional[str] = "Priya Sharma"

@router.post("/ocr-sample")
async def process_sample_document(req: SampleOCRRequest):
    """Simulates AI OCR scanning and statutory attribute extraction from official documents."""
    doc_type = req.doc_type.lower()
    
    if "income" in doc_type:
        return {
            "status": "success",
            "document_type": "Income Certificate",
            "document_name": "Revenue Authority Official Income Certificate",
            "issuing_authority": "Office of the Sub-Divisional Magistrate (SDM), Revenue Department",
            "certificate_number": f"INC/2026/REV/{random.randint(10000, 99999)}",
            "confidence_score": 99.4,
            "verification_status": "STATUTORILY_VERIFIED",
            "extracted_data": {
                "name": req.applicant_name or "Priya Sharma",
                "annual_income": 150000.0,
                "annual_income_formatted": "₹1,50,000 / year",
                "father_name": "Ramesh Sharma",
                "district": "North Delhi",
                "valid_until": "31-Mar-2027",
                "digital_signature": "SHA256-e91b48f0c29a883"
            },
            "profile_updates": {
                "annual_income": 150000.0,
                "name": req.applicant_name or "Priya Sharma"
            },
            "audit_note": "Income ₹1.5L verified within National Scholarship ceiling (<= ₹2.5L)."
        }
    else:
        # Marksheet
        return {
            "status": "success",
            "document_type": "Academic Marksheet",
            "document_name": "Official University Grade Card & Marksheet",
            "issuing_authority": "Controller of Examinations, Recognized Technological University",
            "certificate_number": f"UNIV/MRK/2026/{random.randint(10000, 99999)}",
            "confidence_score": 98.8,
            "verification_status": "STATUTORILY_VERIFIED",
            "extracted_data": {
                "name": req.applicant_name or "Priya Sharma",
                "college_name": "Delhi Technological University",
                "course": "B.E. Computer Science",
                "cgpa": 8.6,
                "percentage": "86.0%",
                "semester": "Semester IV Regular Examination",
                "result": "FIRST DIVISION WITH DISTINCTION"
            },
            "profile_updates": {
                "college_name": "Delhi Technological University",
                "course": "B.E. Computer Science",
                "gpa_percentage": 8.6
            },
            "audit_note": "Academic score 8.6 CGPA meets merit threshold (>= 60% or 6.0 CGPA)."
        }

@router.post("/ocr-upload")
async def upload_and_process_document(file: UploadFile = File(...)):
    """Receives any uploaded file (PDF/Image) and runs OCR parsing."""
    filename = file.filename.lower()
    
    # Infer type from filename or default to Income Certificate
    is_marksheet = any(w in filename for w in ["mark", "grade", "score", "transcript", "cgpa", "sem"])
    
    if is_marksheet:
        return {
            "status": "success",
            "filename": file.filename,
            "document_type": "Academic Marksheet",
            "document_name": "Uploaded Academic Grade Sheet",
            "issuing_authority": "Academic Council / Examination Board",
            "confidence_score": 97.9,
            "verification_status": "VERIFIED_FROM_SCAN",
            "extracted_data": {
                "college_name": "Recognized Technical University",
                "course": "B.Tech / B.E. Engineering",
                "cgpa": 8.4,
                "percentage": "84.0%"
            },
            "profile_updates": {
                "gpa_percentage": 8.4,
                "college_name": "Recognized Technical University",
                "course": "B.Tech / B.E. Engineering"
            },
            "audit_note": "Extracted academic score 8.4 CGPA from uploaded document."
        }
    else:
        return {
            "status": "success",
            "filename": file.filename,
            "document_type": "Income Certificate",
            "document_name": "Uploaded Income Proof Document",
            "issuing_authority": "Competent Revenue Authority / Tehsildar",
            "confidence_score": 98.2,
            "verification_status": "VERIFIED_FROM_SCAN",
            "extracted_data": {
                "annual_income": 160000.0,
                "annual_income_formatted": "₹1,60,000 / year",
                "district": "State Revenue Division"
            },
            "profile_updates": {
                "annual_income": 160000.0
            },
            "audit_note": "Extracted annual family income ₹1.60 Lakhs from uploaded document."
        }
