import json
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import aiosqlite
from models.application import ChatRequest, ChatResponse
from services.ai_service import ai_service
from services.eligibility_service import eligibility_service
from database.connection import DB_PATH

logger = logging.getLogger("civicpilot.routes.chat")
router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def handle_chat_message(req: ChatRequest):
    try:
        # 1. Fetch selected scheme if provided
        selected_scheme = None
        scheme_id = req.selected_scheme_id or "nsp-pms-2026"
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM services WHERE id = ?", (scheme_id,))
            row = await cursor.fetchone()
            if row:
                selected_scheme = dict(row)
                if selected_scheme.get("eligibility_rules"):
                    try:
                        selected_scheme["eligibility_rules"] = json.loads(selected_scheme["eligibility_rules"])
                    except Exception:
                        pass
                if selected_scheme.get("required_documents"):
                    try:
                        selected_scheme["required_documents"] = json.loads(selected_scheme["required_documents"])
                    except Exception:
                        pass

        # 2. Analyze message with AI (Gemini + Smart fallback)
        ai_res = await ai_service.analyze_citizen_request(
            message=req.message,
            current_profile=req.current_profile,
            selected_scheme=selected_scheme
        )

        updated_profile = ai_res.get("updated_profile", {})
        detected_intent = ai_res.get("detected_intent", "provide_info")
        reply = ai_res.get("reply", "")

        # 3. Evaluate Eligibility if profile has details
        eligibility_eval = None
        if selected_scheme and (updated_profile.get("annual_income") or updated_profile.get("gpa_percentage")):
            eligibility_eval = eligibility_service.evaluate(updated_profile, selected_scheme)

        # 4. Fetch recommended schemes
        recommended_schemes = []
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM services WHERE is_active = 1 LIMIT 4")
            rows = await cursor.fetchall()
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
                recommended_schemes.append(item)

        # 5. Check if ready for automation
        mandatory = ["name", "college_name", "annual_income", "gpa_percentage", "category"]
        missing = [f for f in mandatory if not updated_profile.get(f)]
        ready = (len(missing) == 0 and eligibility_eval is not None and eligibility_eval.is_eligible)

        stage = 1
        if updated_profile.get("name"):
            stage = 4
        if eligibility_eval:
            stage = 5

        suggested_action = None
        if ready:
            suggested_action = "START_BROWSER_AUTOMATION"

        return ChatResponse(
            reply=reply,
            updated_profile=updated_profile,
            detected_intent=detected_intent,
            recommended_schemes=recommended_schemes,
            eligibility_evaluation=eligibility_eval,
            missing_fields=missing,
            ready_for_automation=ready,
            suggested_action=suggested_action,
            timeline_current_stage=stage,
            detected_language=ai_res.get("detected_language", "English"),
            language_code=ai_res.get("language_code", "en")
        )

    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice")
async def handle_voice_message(
    file: UploadFile = File(...),
    current_profile: Optional[str] = Form(None),
    selected_scheme_id: Optional[str] = Form(None)
):
    """
    Multimodal Citizen Voice Endpoint:
    Receives real audio recording from microphone (WebM / WAV / MP4 / OGG).
    Calls Gemini multimodal audio intelligence:
    - Auto-detects spoken language (Hindi, Tamil, Marathi, Telugu, Bengali, English, etc.)
    - Accurately transcribes speech in original script
    - Generates response in the EXACT same language
    - Extracts structured citizen attributes
    """
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/webm"

        profile_dict = {}
        if current_profile:
            try:
                profile_dict = json.loads(current_profile)
            except Exception:
                pass

        selected_scheme = None
        scheme_id = selected_scheme_id or "nsp-pms-2026"
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM services WHERE id = ?", (scheme_id,))
            row = await cursor.fetchone()
            if row:
                selected_scheme = dict(row)

        res = await ai_service.process_voice_audio(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            current_profile=profile_dict,
            selected_scheme=selected_scheme
        )

        return res
    except Exception as e:
        logger.error(f"Error in voice chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

