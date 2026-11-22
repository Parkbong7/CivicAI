import uuid
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import aiosqlite
from database.connection import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email address or 10-digit mobile number")
    password: str = Field(..., min_length=4, description="Citizen password")

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Citizen Legal Full Name")
    email: str = Field(..., description="Valid Email Address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    phone: Optional[str] = None
    state: Optional[str] = "Delhi"
    college_name: Optional[str] = None
    course: Optional[str] = None
    annual_income: Optional[float] = 150000.0
    category: Optional[str] = "General"

@router.post("/login")
async def login(req: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    identifier = req.identifier.strip().lower()
    password = req.password.strip()

    # Query user by email or phone
    cursor = await db.execute(
        "SELECT id, name, email, phone, password, college_name, course, annual_income, category FROM users WHERE lower(email) = ? OR phone = ?",
        (identifier, identifier)
    )
    user_row = await cursor.fetchone()

    if not user_row or user_row["password"] != password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please check your email/mobile or password,."
        )

    user_data = {
        "id": user_row["id"],
        "name": user_row["name"],
        "email": user_row["email"],
        "phone": user_row["phone"] or "9876543210",
        "college_name": user_row["college_name"] or "Delhi Technological University",
        "course": user_row["course"] or "B.E. Computer Science",
        "annual_income": user_row["annual_income"] or 150000.0,
        "category": user_row["category"] or "General",
        "token": f"civicpilot_jwt_{uuid.uuid4().hex[:16]}"
    }

    return {
        "status": "success",
        "message": f"Welcome back, {user_data['name']}!",
        "user": user_data
    }

@router.post("/register")
async def register(req: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    email = req.email.strip().lower()
    
    # Validation checks
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise HTTPException(status_code=400, detail="Invalid email format.")

    if req.phone and not re.match(r"^[6-9]\d{9}$", req.phone.strip()):
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit Indian mobile number.")

    # Check if email already registered
    cursor = await db.execute("SELECT id FROM users WHERE lower(email) = ?", (email,))
    existing = await cursor.fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email address already exists.")

    new_id = f"usr_{uuid.uuid4().hex[:8]}"
    phone = req.phone.strip() if req.phone else "9876543210"

    await db.execute("""
        INSERT INTO users (id, name, email, phone, password, college_name, course, annual_income, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id,
        req.name.strip(),
        email,
        phone,
        req.password.strip(),
        req.college_name or "General Public",
        req.course or "Citizen Service",
        req.annual_income or 150000.0,
        req.category or "General"
    ))
    await db.commit()

    user_data = {
        "id": new_id,
        "name": req.name.strip(),
        "email": email,
        "phone": phone,
        "college_name": req.college_name or "Recognized College",
        "course": req.course or "Undergraduate Degree",
        "annual_income": req.annual_income or 150000.0,
        "category": req.category or "General",
        "token": f"civicpilot_jwt_{uuid.uuid4().hex[:16]}"
    }

    return {
        "status": "success",
        "message": "Citizen profile registered successfully!",
        "user": user_data
    }

@router.post("/sso-digilocker")
async def sso_digilocker(db: aiosqlite.Connection = Depends(get_db)):
    """Simulates National Single Sign-On (MeriPehchaan / DigiLocker / Jan Parichay)"""
    cursor = await db.execute("SELECT * FROM users WHERE email = 'priya.sharma@example.com'")
    user_row = await cursor.fetchone()
    
    if not user_row:
        user_row = {
            "id": "usr_digilocker_live",
            "name": "Priya Sharma",
            "email": "priya.sharma@example.com",
            "phone": "9876543210",
            "college_name": "Delhi Technological University",
            "course": "B.E. Computer Science",
            "annual_income": 150000.0,
            "category": "OBC"
        }

    return {
        "status": "success",
        "provider": "DigiLocker / MeriPehchaan SSO",
        "verified_by": "Government of India",
        "user": {
            "id": user_row["id"],
            "name": user_row["name"],
            "email": user_row["email"],
            "phone": user_row["phone"] or "9876543210",
            "college_name": user_row["college_name"] or "Recognized Institution",
            "course": user_row["course"] or "Citizen Service",
            "annual_income": user_row["annual_income"] or 150000.0,
            "category": user_row["category"] or "OBC",
            "aadhaar_number": "XXXXXXXX9842",
            "state": "Delhi",
            "auth_method": "DigiLocker / MeriPehchaan (Aadhaar e-KYC)",
            "token": f"digilocker_jwt_{uuid.uuid4().hex[:16]}"
        }
    }
