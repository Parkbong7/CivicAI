import os
import json
import sqlite3
import aiosqlite
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "civicpilot.db")

INITIAL_SCHEMES = [
    {
        "id": "nsp-pms-2026",
        "title": "Post-Matric Scholarship Scheme for College & University Students",
        "department": "Ministry of Education / MoMA, Govt. of India",
        "portal_url": "https://scholarships.gov.in",
        "official_source": "National Scholarship Portal (NSP) - Official Govt. Portal",
        "category": "Scholarship",
        "award_amount": "₹25,000 - ₹50,000 / year",
        "deadline": "2026-12-31",
        "description": "Financial assistance for meritorious students pursuing post-matriculation or higher education in recognized colleges and universities across India.",
        "eligibility_rules": {
            "max_annual_income": 250000,
            "min_gpa": 6.0,
            "min_percentage": 55.0,
            "required_education_level": ["Undergraduate", "Postgraduate", "Diploma"],
            "target_beneficiaries": "Economically disadvantaged and meritorious college students"
        },
        "required_documents": [
            "Current College / University ID Card or Bonafide Certificate",
            "Previous Year Academic Marksheet / Grade Card",
            "Official Family Income Certificate issued by competent Revenue Authority",
            "Active Student Bank Account Passbook / Statement with IFSC",
            "Valid Government Photo ID (Aadhaar / Voter ID)"
        ],
        "is_active": True
    },
    {
        "id": "nsp-csss-2026",
        "title": "Central Sector Scheme of Scholarship for College Students (CSSS)",
        "department": "Department of Higher Education, Govt. of India",
        "portal_url": "https://scholarships.gov.in",
        "official_source": "National Scholarship Portal (NSP) - Official Govt. Portal",
        "category": "Merit-Based Scholarship",
        "award_amount": "₹12,000 - ₹20,000 / year",
        "deadline": "2027-01-15",
        "description": "Provides financial support to top meritorious students in higher secondary exams to meet daily expenses while pursuing graduate and professional studies.",
        "eligibility_rules": {
            "max_annual_income": 450000,
            "min_gpa": 7.5,
            "min_percentage": 75.0,
            "required_education_level": ["Undergraduate", "Postgraduate"],
            "target_beneficiaries": "Top 80th percentile students pursuing regular degree programs"
        },
        "required_documents": [
            "Senior Secondary (Class 12) Official Marksheet",
            "Income Certificate issued by Tehsildar / SDO",
            "Institution Bonafide Certificate / Fee Receipt",
            "Bank Account linked with Aadhaar",
            "Applicant Photograph and Signature"
        ],
        "is_active": True
    },
    {
        "id": "aicte-pragati-2026",
        "title": "AICTE Pragati Scholarship for Girl Students (Technical Degree)",
        "department": "All India Council for Technical Education (AICTE)",
        "portal_url": "https://www.aicte-pragati-saksham-gov.in",
        "official_source": "AICTE National Portal for Pragati & Saksham Schemes",
        "category": "Women in Tech",
        "award_amount": "₹50,000 / year",
        "deadline": "2026-11-30",
        "description": "Empowering young female students admitted to 1st year of technical degree/diploma courses in AICTE-approved institutions with tuition and contingency grant.",
        "eligibility_rules": {
            "max_annual_income": 800000,
            "gender": "Female",
            "min_gpa": 6.5,
            "min_percentage": 60.0,
            "required_education_level": ["Undergraduate", "Diploma"],
            "target_beneficiaries": "Female students admitted to AICTE approved engineering/technology courses"
        },
        "required_documents": [
            "Central/State Counseling Allotment Letter for AICTE Institution",
            "Tuition Fee Paid Receipt",
            "Annual Family Income Certificate (< ₹8 Lakhs)",
            "Aadhaar Card copy",
            "Bank Account Details (Single account in student name)"
        ],
        "is_active": True
    },
    {
        "id": "mcm-tech-2026",
        "title": "Merit-cum-Means Scholarship for Professional & Technical Courses",
        "department": "Ministry of Minority Affairs, Govt. of India",
        "portal_url": "https://scholarships.gov.in",
        "official_source": "National Scholarship Portal (NSP)",
        "category": "Professional Courses",
        "award_amount": "Full Course Fee Reimbursement + ₹10,000 Maintenance",
        "deadline": "2026-12-31",
        "description": "Financial assistance to poor and meritorious students pursuing graduation and post-graduation in professional courses like B.Tech, MBBS, MBA, and MCA.",
        "eligibility_rules": {
            "max_annual_income": 250000,
            "min_gpa": 6.0,
            "min_percentage": 50.0,
            "required_education_level": ["Undergraduate", "Postgraduate"],
            "target_beneficiaries": "Students pursuing designated technical or professional degree courses"
        },
        "required_documents": [
            "Course Admission Verification Letter",
            "Marksheet of qualifying examination with min 50% score",
            "Income Declaration / Certificate",
            "Bank Passbook copy",
            "Hostel Stay Certificate (if applicable)"
        ],
        "is_active": True
    },
    {
        "id": "morth-dl-renewal-2026",
        "title": "Driving Licence Renewal & Learner's Licence (Parivahan Sewa)",
        "department": "Ministry of Road Transport & Highways (MoRTH), Govt. of India",
        "portal_url": "https://parivahan.gov.in",
        "official_source": "Sarathi Parivahan Citizen Portal (MoRTH)",
        "category": "Transport & Mobility",
        "award_amount": "Statutory Service Delivery (Official Fee: ₹200 - ₹400)",
        "deadline": "2027-12-31",
        "description": "End-to-end citizen service for permanent driving licence renewal, learner licence online slot booking, and vehicle class endorsement under the Motor Vehicles Act.",
        "eligibility_rules": {
            "min_age": 18,
            "medical_fitness_required_above_age": 40,
            "target_beneficiaries": "Citizens seeking Permanent Driving Licence renewal or computer-based Learner's test"
        },
        "required_documents": [
            "Existing Driving Licence (or Learner Licence Reference Number)",
            "Form 1 (Self-Declaration of Physical Fitness)",
            "Form 1A (Medical Certificate by registered practitioner if age > 40)",
            "Proof of Age & Address (Aadhaar Card, Voter ID, or Passport)",
            "Recent Passport Size Photograph & Specimen Digital Signature"
        ],
        "is_active": True
    },
    {
        "id": "edistrict-income-domicile-2026",
        "title": "Income, Domicile & Permanent Residence Certificate Issuance",
        "department": "Department of Revenue, State Governments / National e-District Mission",
        "portal_url": "https://edistrict.gov.in",
        "official_source": "National e-District Service Delivery Gateway",
        "category": "Civil Certificates",
        "award_amount": "Legally Certified Statutory Proof (Valid for Welfare, Quotas & Admissions)",
        "deadline": "2027-12-31",
        "description": "Digitally signed, QR-code verifiable legal proof of family annual income and continuous residence within the state, mandatory for welfare schemes and fee concessions.",
        "eligibility_rules": {
            "min_residence_years": 3,
            "target_beneficiaries": "State residents requiring statutory income certification or domicile proof"
        },
        "required_documents": [
            "Aadhaar Card / Government Photo Identity Card",
            "Proof of Continuous Residence (Electricity Bill, Water Bill, or Gas Connection Passbook)",
            "Income Assessment Proof (Salary Slip, Form 16, Bank Statement, or Revenue Self-Declaration)",
            "Passport Size Photograph of Applicant & Signed Statutory Undertaking"
        ],
        "is_active": True
    },
    {
        "id": "pm-kisan-dbt-2026",
        "title": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) & Agri-DBT",
        "department": "Department of Agriculture & Farmers Welfare, Govt. of India",
        "portal_url": "https://pmkisan.gov.in",
        "official_source": "PM-KISAN Central Portal & DBT Bharat",
        "category": "Agriculture & Subsidies",
        "award_amount": "₹6,000 / year (3 installments of ₹2,000 via Direct Bank Transfer)",
        "deadline": "2027-12-31",
        "description": "Central sector income support scheme providing direct cash assistance into Aadhaar-seeded bank accounts of small and marginal farmer families possessing cultivable land.",
        "eligibility_rules": {
            "landholding": "Cultivable land in official state land records",
            "aadhaar_seeded_bank": True,
            "target_beneficiaries": "Small and marginal landholder farmer families"
        },
        "required_documents": [
            "Land Ownership Record (Khata / Khasra / RoR Document)",
            "Aadhaar Card with linked active mobile number",
            "Active Bank Account Passbook with IFSC Code (Aadhaar Seeded)",
            "Biometric e-KYC or Aadhaar OTP Verification"
        ],
        "is_active": True
    },
    {
        "id": "nfsa-ration-card-2026",
        "title": "National Food Security Act (NFSA) Digital Ration Card & PDS",
        "department": "Department of Food & Public Distribution, Govt. of India",
        "portal_url": "https://nfsa.gov.in",
        "official_source": "Annavitran & One Nation One Ration Card (ONORC)",
        "category": "Food Security & Welfare",
        "award_amount": "Subsidized/Free Foodgrains (5 kg/person/month) + Nationwide Portability",
        "deadline": "2027-12-31",
        "description": "Issuance and renewal of digital Antyodaya Anna Yojana (AAY) and Priority Household (PHH) electronic ration cards with nationwide biometric portability under ONORC.",
        "eligibility_rules": {
            "max_annual_income": 100000,
            "target_beneficiaries": "Economically weaker families and priority households under NFSA"
        },
        "required_documents": [
            "Family Group Photograph with Head of Household",
            "Aadhaar Cards of all declared family members",
            "Proof of Current Residential Address",
            "Income Certificate issued by designated Revenue Authority"
        ],
        "is_active": True
    }
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Applications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        reference_number TEXT UNIQUE,
        scheme_id TEXT NOT NULL,
        scheme_title TEXT NOT NULL,
        mode TEXT DEFAULT 'demo',
        applicant_name TEXT,
        applicant_email TEXT,
        applicant_phone TEXT,
        applicant_dob TEXT,
        gender TEXT,
        category TEXT,
        annual_income REAL,
        gpa_percentage REAL,
        college_name TEXT,
        course TEXT,
        year_of_study TEXT,
        bank_name TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        aadhaar_number TEXT,
        status TEXT DEFAULT 'draft',
        eligibility_status TEXT,
        eligibility_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP,
        receipt_data TEXT,
        execution_logs TEXT,
        browser_screenshots TEXT
    )
    """)

    # Services catalog table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT,
        portal_url TEXT,
        official_source TEXT,
        category TEXT,
        award_amount TEXT,
        deadline TEXT,
        description TEXT,
        eligibility_rules TEXT,
        required_documents TEXT,
        is_active INTEGER DEFAULT 1,
        last_discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Populate services if empty
    cursor.execute("SELECT COUNT(*) FROM services")
    count = cursor.fetchone()[0]
    if count == 0:
        for s in INITIAL_SCHEMES:
            cursor.execute("""
            INSERT INTO services (
                id, title, department, portal_url, official_source, category,
                award_amount, deadline, description, eligibility_rules,
                required_documents, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["id"], s["title"], s["department"], s["portal_url"], s["official_source"],
                s["category"], s["award_amount"], s["deadline"], s["description"],
                json.dumps(s["eligibility_rules"]), json.dumps(s["required_documents"]),
                1 if s["is_active"] else 0
            ))

    
    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        college_name TEXT,
        course TEXT,
        annual_income REAL,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
        INSERT INTO users (id, name, email, phone, password, college_name, course, annual_income, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [
            ('usr_priya', 'Priya Sharma', 'priya.sharma@example.com', '9876543210', 'password123', 'Delhi Technological University', 'B.E. Computer Science', 150000.0, 'OBC'),
            ('usr_rahul', 'Rahul Verma', 'rahul.verma@example.com', '9812345678', 'password123', 'IIT Delhi', 'B.Tech Computer Science', 180000.0, 'General')
        ])

    conn.commit()
    conn.close()

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
