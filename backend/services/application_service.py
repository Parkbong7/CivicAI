import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import aiosqlite
from database.connection import DB_PATH

class ApplicationService:
    @staticmethod
    async def list_applications() -> List[Dict[str, Any]]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM applications ORDER BY created_at DESC")
            rows = await cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                if item.get("receipt_data"):
                    try:
                        item["receipt_data"] = json.loads(item["receipt_data"])
                    except Exception:
                        pass
                if item.get("execution_logs"):
                    try:
                        item["execution_logs"] = json.loads(item["execution_logs"])
                    except Exception:
                        pass
                results.append(item)
            return results

    @staticmethod
    async def get_application(app_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
            row = await cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            if item.get("receipt_data"):
                try:
                    item["receipt_data"] = json.loads(item["receipt_data"])
                except Exception:
                    pass
            if item.get("execution_logs"):
                try:
                    item["execution_logs"] = json.loads(item["execution_logs"])
                except Exception:
                    pass
            return item

    @staticmethod
    async def save_draft_or_update(
        scheme_id: str,
        scheme_title: str,
        applicant: Dict[str, Any],
        app_id: Optional[str] = None,
        mode: str = "live",
        status: str = "draft",
        eligibility_status: Optional[str] = None,
        eligibility_notes: Optional[str] = None
    ) -> str:
        app_id = app_id or str(uuid.uuid4())
        ref_no = f"CP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
            INSERT INTO applications (
                id, reference_number, scheme_id, scheme_title, mode,
                applicant_name, applicant_email, applicant_phone, applicant_dob,
                gender, category, annual_income, gpa_percentage, college_name,
                course, year_of_study, bank_name, account_number, ifsc_code,
                aadhaar_number, status, eligibility_status, eligibility_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                applicant_name=excluded.applicant_name,
                applicant_email=excluded.applicant_email,
                applicant_phone=excluded.applicant_phone,
                applicant_dob=excluded.applicant_dob,
                gender=excluded.gender,
                category=excluded.category,
                annual_income=excluded.annual_income,
                gpa_percentage=excluded.gpa_percentage,
                college_name=excluded.college_name,
                course=excluded.course,
                year_of_study=excluded.year_of_study,
                status=excluded.status,
                eligibility_status=excluded.eligibility_status,
                eligibility_notes=excluded.eligibility_notes
            """, (
                app_id, ref_no, scheme_id, scheme_title, mode,
                applicant.get("name"), applicant.get("email"), applicant.get("phone"), applicant.get("dob"),
                applicant.get("gender"), applicant.get("category"), applicant.get("annual_income"),
                applicant.get("gpa_percentage"), applicant.get("college_name"), applicant.get("course"),
                applicant.get("year_of_study"), applicant.get("bank_name"), applicant.get("account_number"),
                applicant.get("ifsc_code"), applicant.get("aadhaar_number"), status,
                eligibility_status, eligibility_notes
            ))
            await db.commit()
            return app_id

    @staticmethod
    async def mark_submitted(
        app_id: str,
        reference_number: str,
        receipt_data: Dict[str, Any],
        logs: Optional[List[str]] = None
    ):
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
            UPDATE applications SET
                reference_number = ?,
                status = 'submitted',
                submitted_at = CURRENT_TIMESTAMP,
                receipt_data = ?,
                execution_logs = ?
            WHERE id = ?
            """, (
                reference_number,
                json.dumps(receipt_data),
                json.dumps(logs or []),
                app_id
            ))
            await db.commit()

application_service = ApplicationService()
