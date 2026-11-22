import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
import aiosqlite
from database.connection import DB_PATH
from services.government_discovery import government_discovery_service

logger = logging.getLogger("civicpilot.routes.services")
router = APIRouter(prefix="/api/services", tags=["Services Catalog & Live Discovery"])

@router.get("")
async def list_government_services(category: Optional[str] = None):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            if category:
                cursor = await db.execute("SELECT * FROM services WHERE category = ? AND is_active = 1", (category,))
            else:
                cursor = await db.execute("SELECT * FROM services WHERE is_active = 1")
            rows = await cursor.fetchall()
            schemes = []
            for r in rows:
                item = dict(r)
                if item.get("eligibility_rules"):
                    try:
                        item["eligibility_rules"] = json.loads(item["eligibility_rules"])
                    except Exception:
                        pass
                if item.get("required_documents"):
                    try:
                        item["required_documents"] = json.loads(item["required_documents"])
                    except Exception:
                        pass
                schemes.append(item)
            return {"status": "success", "count": len(schemes), "services": schemes}
    except Exception as e:
        logger.error(f"Error fetching services: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{service_id}")
async def get_service_detail(service_id: str):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM services WHERE id = ?", (service_id,))
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Service scheme not found")
            item = dict(row)
            if item.get("eligibility_rules"):
                try:
                    item["eligibility_rules"] = json.loads(item["eligibility_rules"])
                except Exception:
                    pass
            if item.get("required_documents"):
                try:
                    item["required_documents"] = json.loads(item["required_documents"])
                except Exception:
                    pass
            return {"status": "success", "service": item}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching service {service_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/discover")
async def trigger_live_portal_discovery(portal_url: Optional[str] = "https://scholarships.gov.in"):
    """
    Mode 1: Navigates public official government website using Playwright,
    extracts live announcements, eligibility details, and application deadlines.
    """
    try:
        discovery_res = await government_discovery_service.discover_official_portal(
            portal_url=portal_url or "https://scholarships.gov.in"
        )
        return discovery_res
    except Exception as e:
        logger.error(f"Error during live portal discovery: {e}", exc_info=True)
        return {
            "status": "partial_fallback",
            "portal_url": portal_url,
            "error": str(e),
            "extracted_schemes": government_discovery_service._get_verified_schemes_mirror(portal_url)
        }
