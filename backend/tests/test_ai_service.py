import os
import json
import pytest
from unittest.mock import MagicMock
from services.ai_service import ai_service, AIService

def test_language_detection_tamil_script():
    tamil_text = "வணக்கம் எனக்கு ஸ்காலர்ஷிப் வேண்டும்"
    lang_name, lang_code = AIService.detect_language(tamil_text)
    assert lang_name == "Tamil"
    assert lang_code == "ta"

def test_language_detection_tanglish():
    tanglish_text = "enakku driving licence apply pannanum bro"
    lang_name, lang_code = AIService.detect_language(tanglish_text)
    assert lang_name == "Tamil"
    assert lang_code == "ta"

def test_language_detection_hindi_script():
    hindi_text = "नमस्ते मुझे स्कॉलरशिप के लिए आवेदन करना है"
    lang_name, lang_code = AIService.detect_language(hindi_text)
    assert lang_name == "Hindi"
    assert lang_code == "hi"

def test_language_detection_hinglish():
    hinglish_text = "mujhe apna scholarship apply karna hai kaise kare"
    lang_name, lang_code = AIService.detect_language(hinglish_text)
    assert lang_name == "Hindi"
    assert lang_code == "hi"

def test_language_detection_telugu():
    telugu_text = "\u0c28\u0c2e\u0c38\u0c4d\u0c15\u0c3e\u0c30\u0c02 \u0c28\u0c3e\u0c15\u0c41 \u0c32\u0c48\u0c38\u0c46\u0c28\u0c4d\u0c38\u0c4d \u0c15\u0c3e\u0c35\u0c3e\u0c32\u0c3f"
    lang_name, lang_code = AIService.detect_language(telugu_text)
    assert lang_name == "Telugu"
    assert lang_code == "te"

def test_language_detection_english_fallback():
    english_text = "Hello, please help me renew my driving licence"
    lang_name, lang_code = AIService.detect_language(english_text)
    assert lang_name == "English"
    assert lang_code == "en"

def test_gemini_api_key_update():
    service = AIService()
    service.update_api_key("new_test_key_123")
    assert service.api_key == "new_test_key_123"

@pytest.mark.asyncio
async def test_smart_fallback_driving_licence():
    # Test local NLP fallback directly without external API
    result = ai_service._smart_nlp_fallback(
        text="I need to renew my driving licence on Parivahan",
        current_profile={},
        selected_scheme=None
    )
    assert result is not None
    assert "reply" in result
    assert "parivahan" in result["reply"].lower() or "driving licence" in result["reply"].lower()

@pytest.mark.asyncio
async def test_smart_fallback_pm_kisan():
    result = ai_service._smart_nlp_fallback(
        text="How to get PM-KISAN subsidy?",
        current_profile={},
        selected_scheme=None
    )
    assert result is not None
    assert "reply" in result
    assert "pm-kisan" in result["reply"].lower() or "kisan" in result["reply"].lower()

@pytest.mark.asyncio
async def test_ai_response_fallback_on_gemini_exception(monkeypatch):
    """When Gemini client throws an exception, AI service returns a safe, helpful fallback."""
    faulty_client = MagicMock()
    faulty_client.models.generate_content.side_effect = Exception("API Quota exceeded / Timeout")
    monkeypatch.setattr(ai_service, "client", faulty_client)

    result = await ai_service.analyze_citizen_request(
        message="I want to apply for college scholarship",
        current_profile={},
        selected_scheme=None
    )

    assert result is not None
    assert "reply" in result
    assert "scholarship" in result["reply"].lower() or "namaste" in result["reply"].lower()

@pytest.mark.asyncio
async def test_ai_response_gemini_success(monkeypatch):
    """When Gemini returns valid JSON, parser extracts structured data and reply."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "reply": "I have extracted your information. You are eligible to apply.",
        "extracted_profile_updates": {
            "name": "Priya Sharma",
            "annual_income": 150000,
            "college_name": "Delhi Technological University"
        },
        "detected_intent": "provide_info",
        "recommended_scheme_keywords": ["scholarship"]
    })
    mock_client.models.generate_content.return_value = mock_response
    monkeypatch.setattr(ai_service, "client", mock_client)

    result = await ai_service.analyze_citizen_request(
        message="My name is Priya Sharma, DTU, income 1.5 Lakhs",
        current_profile={},
        selected_scheme=None
    )

    assert result is not None
    assert "Priya Sharma" in result["updated_profile"]["name"]
    assert result["updated_profile"]["annual_income"] == 150000
    assert "extracted your information" in result["reply"].lower()
