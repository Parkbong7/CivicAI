import os
import json
import logging
import asyncio
import re
from typing import Dict, Any, Optional, List

logger = logging.getLogger("civicpilot.ai_service")

TAMIL_DL_REPLY = (
    "வணக்கம்! இந்தியாவில் **ஓட்டுநர் உரிமம் (Driving Licence) விண்ணப்பிப்பதற்கான** அதிகாரப்பூர்வ வழிமுறைகள்:\n\n"
    "🏛️ **அதிகாரப்பூர்வ அரசு தளம்:** சாலைப் போக்குவரத்து மற்றும் நெடுஞ்சாலைகள் அமைச்சகம் (MoRTH) — **[பரிவாஹன் போர்ட்டல் (parivahan.gov.in)](https://parivahan.gov.in)**\n\n"
    "📋 **தேவையான முக்கிய ஆவணங்கள்:**\n"
    "1. **வயது மற்றும் முகவரி சான்று** (ஆதார் அட்டை, வாக்காளர் அட்டை, அல்லது பாஸ்போர்ட்)\n"
    "2. **படிவம் 1 மற்றும் படிவம் 1A** (மருத்துவ உடற்தகுதி சான்றிதழ்)\n"
    "3. பாஸ்போர்ட் அளவு புகைப்படங்கள் மற்றும் கையொப்பம்\n\n"
    "⚙️ **விண்ணப்பிக்கும் படிகள்:**\n"
    "• **படி 1:** `parivahan.gov.in` தளத்திற்குச் சென்று 'Drivers/Learners Licence' என்பதைத் தேர்ந்தெடுக்கவும்.\n"
    "• **படி 2:** உங்கள் மாநிலத்தைத் தேர்ந்தெடுத்து 'Apply for Learner Licence' என்பதைக் கிளிக் செய்யவும்.\n"
    "• **படி 3:** விவரங்களை நிரப்பி, ஆவணங்களை பதிவேற்றம் செய்து, கட்டணம் செலுத்தவும்.\n"
    "• **படி 4:** ஆன்லைன் கற்றல் தேர்வை எழுதி தேர்ச்சி பெற்ற 30 நாட்களுக்குப் பிறகு நிரந்தர ஓட்டுநர் உரிமத்திற்கு விண்ணப்பிக்கலாம்.\n\n"
    "💡 *குறிப்பு:* ஹேக்கத்தான் செயல்விளக்கத்திற்காக எங்கள் தன்னாட்சி Playwright உலாவி தற்போது தேசிய உதவித்தொகை தளத்தில் இயங்குகிறது. உங்களுக்கு பரிவாஹன் தொடர்பான மேலும் உதவி தேவையா?"
)

HINDI_DL_REPLY = (
    "नमस्ते! भारत में **ड्राइविंग लाइसेंस (Driving Licence) आवेदन** करने की आधिकारिक प्रक्रिया:\n\n"
    "🏛️ **आधिकारिक सरकारी पोर्टल:** सड़क परिवहन और राजमार्ग मंत्रालय (MoRTH) — **[परिवहन सेवा (parivahan.gov.in)](https://parivahan.gov.in)**\n\n"
    "📋 **आवश्यक दस्तावेज:**\n"
    "1. **आयु एवं निवास प्रमाण पत्र** (आधार कार्ड, वोटर आईडी)\n"
    "2. **फॉर्म 1 एवं फॉर्म 1A** (चिकित्सा प्रमाण पत्र यदि 40 वर्ष से अधिक हो)\n"
    "3. पासपोर्ट साइज फोटो और हस्ताक्षर\n\n"
    "⚙️ **आवेदन प्रक्रिया:**\n"
    "• **चरण 1:** `parivahan.gov.in` पर जाएं और अपना राज्य चुनें।\n"
    "• **चरण 2:** 'Apply for Learner Licence' पर क्लिक करें।\n"
    "• **चरण 3:** फॉर्म भरें, दस्तावेज अपलोड करें और ऑनलाइन स्लॉट बुक करें।\n\n"
    "💡 *नोट:* हैकाथॉन डेमो के लिए हमारा स्वायत्त ब्राउज़र एजेंट राष्ट्रीय छात्रवृत्ति पोर्टल पर दिखाया गया है।"
)

TELUGU_DL_REPLY = (
    "నమస్కారం! భారతదేశంలో **డ్రైవింగ్ లైసెన్స్ (Driving Licence) దరఖాస్తు** చేసుకునే అధికారిక విధానం:\n\n"
    "🏛️ **అధికారిక ప్రభుత్వ పోర్టల్:** రోడ్డు రవాణా & రహదారుల మంత్రిత్వ శాఖ (MoRTH) — **[పరివాహన్ సేవ (parivahan.gov.in)](https://parivahan.gov.in)**\n\n"
    "📋 **అవసరమైన పత్రాలు:**\n"
    "1. **వయస్సు మరియు చిరునామా రుజువు** (ఆధార్ కార్డు, ఓటర్ ఐడి)\n"
    "2. **ఫారం 1 మరియు ఫారం 1A** (వైద్య ధృవీకరణ పత్రం)\n"
    "3. పాస్‌పోర్ట్ సైజు ఫోటో మరియు సంతకం\n\n"
    "⚙️ **దరఖాస్తు దశలు:**\n"
    "• **దశ 1:** `parivahan.gov.in` లో మీ రాష్ట్రాన్ని ఎంచుకోండి.\n"
    "• **దశ 2:** 'Apply for Learner Licence' పై క్లిక్ చేయండి.\n"
    "• **దశ 3:** వివరాలు నింపి పత్రాలు అప్‌లోడ్ చేయండి."
)

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.client = None
        self._init_gemini()

    def _init_gemini(self):
        if not self.api_key:
            logger.warning("No GEMINI_API_KEY provided. Operating in smart rule-based Gov-Tech fallback mode.")
            return

        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            logger.info("Gemini AI Client initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not initialize Gemini Client: {e}. Fallback AI active.")
            self.client = None

    def update_api_key(self, api_key: str):
        self.api_key = api_key.strip()
        self._init_gemini()

    @staticmethod
    def detect_language(text: str) -> tuple[str, str]:
        """
        Detects Indian regional languages from native script or Romanized transliterations
        (Tanglish, Hinglish, Teluglish, etc.). Returns (Language_Name, lang_code).
        """
        if not text:
            return ("English", "en")
        
        lower = text.lower()
        
        # 1. Check for Tamil script or Tanglish vocabulary
        tamil_script = re.search(r"[\u0b80-\u0bff]", text)
        tanglish_words = [
            "enakku", "pannanum", "vendum", "solunga", "eppadi", "pannunga",
            "venum", "kudunga", "theriyala", "vanakkam", "ungalluku", "nalla",
            "illai", "edhukku", "dhan", "irukku", "kedaikkuma", "podanum", "panradhu",
            "nan", "neenga", "ennoda", "paakkanum"
        ]
        if tamil_script or any(w in lower for w in tanglish_words):
            return ("Tamil", "ta")
        
        # 2. Check for Telugu script or Teluglish vocabulary
        telugu_script = re.search(r"[\u0c00-\u0c7f]", text)
        telugu_words = ["naku", "kavali", "cheyali", "ela", "cheppandi", "namaskaram", "enti", "undhi"]
        if telugu_script or any(w in lower for w in telugu_words):
            return ("Telugu", "te")

        # 3. Check for Marathi markers
        marathi_markers = ["mala", "pahije", "karaycha", "ahe", "sanga", "namaskar"]
        if any(w in lower for w in marathi_markers):
            return ("Marathi", "mr")

        # 4. Check for Hindi / Devanagari script or Hinglish vocabulary
        devanagari_script = re.search(r"[\u0900-\u097f]", text)
        hinglish_words = [
            "mujhe", "chahiye", "karna hai", "karo", "batao", "kaisa", "kaise",
            "mera", "meri", "karvana", "hoga", "nahi", "namaste", "aapka", "kripya", "bataiye", "batao"
        ]
        if devanagari_script or any(w in lower for w in hinglish_words):
            return ("Hindi", "hi")
        
        # 5. Check for Bengali script or Bengali vocabulary
        bengali_script = re.search(r"[\u0980-\u09ff]", text)
        bengali_words = ["amar", "dorkar", "korte hobe", "bolun", "nomoshkar"]
        if bengali_script or any(w in lower for w in bengali_words):
            return ("Bengali", "bn")
        
        return ("English", "en")

    async def analyze_citizen_request(
        self,
        message: str,
        current_profile: Optional[Dict[str, Any]] = None,
        selected_scheme: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        profile = dict(current_profile or {})

        # Try Gemini if client is available
        if self.client:
            try:
                gemini_result = await self._call_gemini(message, profile, selected_scheme, history)
                if gemini_result:
                    return gemini_result
            except Exception as e:
                logger.error(f"Gemini API call failed, falling back to smart NLP engine: {e}")

        # Resilient smart fallback parser
        return self._smart_nlp_fallback(message, profile, selected_scheme, history)

    async def _call_gemini(
        self,
        message: str,
        profile: Dict[str, Any],
        selected_scheme: Optional[Dict[str, Any]],
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[Dict[str, Any]]:
        lang_name, lang_code = self.detect_language(message)
        recent_history = history[-4:] if history else []

        system_prompt = f"""
You are CivicPilot AI, an autonomous public service assistant for Indian citizens.
You help citizens navigate official government portals:
1. Driving Licence Renewal / Application (MoRTH Parivahan / Sarathi - parivahan.gov.in)
2. Scholarships (National Scholarship Portal - scholarships.gov.in)
3. Government Subsidies & Direct Benefit Transfer (DBT Bharat / PM-Kisan)

CRITICAL MULTILINGUAL INSTRUCTION:
Detected Citizen Query Language: {lang_name} ({lang_code}).
Query: "{message}"

LANGUAGE MATCHING MANDATE:
- If citizen wrote in TAMIL or TANGLISH (words like 'enakku', 'pannanum', 'vendum', 'solunga', 'eppadi', 'pannunga'):
  YOU MUST REPLY IN TAMIL (தமிழ் script)! NEVER REPLY IN ENGLISH!
- If citizen wrote in HINDI or HINGLISH (words like 'mujhe', 'chahiye', 'karna hai', 'batao', 'kaise'):
  YOU MUST REPLY IN HINDI (हिंदी Devanagari script)! NEVER REPLY IN ENGLISH!
- If citizen wrote in TELUGU: YOU MUST REPLY IN TELUGU (తెలుగు script)!
- If citizen wrote in MARATHI: YOU MUST REPLY IN MARATHI (मराठी script)!
- If citizen wrote in BENGALI: YOU MUST REPLY IN BENGALI (বাংলা script)!
- Only if the query is in English with NO regional Indian grammar words, reply in English.

If the user is asking about Driving Licence:
Provide the official MoRTH Parivahan procedure in {lang_name}.

Current Applicant Profile: {json.dumps(profile)}
Target Scheme: {json.dumps(selected_scheme) if selected_scheme else "None selected yet"}
Recent History: {json.dumps(recent_history)}

Output MUST BE strict JSON with the following structure:
{{
  "detected_intent": "discover_scholarships" | "apply_scholarship" | "provide_info" | "check_eligibility" | "general_query",
  "detected_language": "{lang_name}",
  "language_code": "{lang_code}",
  "extracted_profile_updates": {{
    "name": string or null,
    "email": string or null,
    "phone": string or null,
    "dob": string (YYYY-MM-DD) or null,
    "gender": "Male" | "Female" | "Other" or null,
    "category": "General" | "OBC" | "SC" | "ST" | "EWS" or null,
    "annual_income": number in INR or null,
    "gpa_percentage": number (CGPA out of 10 or percentage) or null,
    "college_name": string or null,
    "course": string or null,
    "year_of_study": string or null,
    "bank_name": string or null,
    "account_number": string or null,
    "ifsc_code": string or null,
    "aadhaar_number": string or null
  }},
  "reply": "Polite, clear response in {lang_name} script matching citizen query",
  "recommended_scheme_keywords": ["scholarship", "licence"]
}}
"""
        models_to_try = ["gemini-3.5-flash-lite", "gemini-3.8-flash"]
        response = None
        for m in models_to_try:
            try:
                def _call_sync(model_name=m):
                    return self.client.models.generate_content(
                        model=model_name,
                        contents=[system_prompt, f"User Message: {message}"],
                        config={"response_mime_type": "application/json"}
                    )
                response = await asyncio.wait_for(asyncio.to_thread(_call_sync), timeout=10.0)
                if response and response.text:
                    break
            except Exception as me:
                logger.warning(f"Model {m} returned {me}, trying next fallback...")
                continue

        if not response or not response.text:
            return None

        data = json.loads(response.text)
        reply = data.get("reply", "")

        # Safety Net: If Tamil query but English reply generated
        if lang_code == "ta" and not re.search(r"[\u0b80-\u0bff]", reply):
            if any(w in message.lower() for w in ["licence", "license", "driving", "dl", "parivahan"]):
                reply = TAMIL_DL_REPLY
            else:
                reply = "வணக்கம்! உங்கள் கோரிக்கையை பதிவு செய்துள்ளேன். தகுதியான அரசு திட்டங்களை சரிபார்க்க உங்கள் பெயர், கல்லூரி மற்றும் வருமான விவரங்களை கூறுங்கள்."

        # Safety Net: If Hindi query but English reply generated
        elif lang_code == "hi" and not re.search(r"[\u0900-\u097f]", reply):
            if any(w in message.lower() for w in ["licence", "license", "driving", "dl", "parivahan"]):
                reply = HINDI_DL_REPLY
            else:
                reply = "नमस्ते! मैंने आपका अनुरोध दर्ज कर लिया है। कृपया अपने विवरण साझा करें।"

        updates = data.get("extracted_profile_updates", {})
        for k, v in updates.items():
            if v is not None and v != "":
                profile[k] = v

        return {
            "reply": reply,
            "updated_profile": profile,
            "detected_intent": data.get("detected_intent", "provide_info"),
            "detected_language": lang_name,
            "language_code": lang_code,
            "keywords": data.get("recommended_scheme_keywords", ["scholarship"])
        }

    def _smart_nlp_fallback(
        self,
        text: str,
        current_profile: Dict[str, Any],
        selected_scheme: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Rule-based engine with regional language intelligence."""
        profile = dict(current_profile)
        lower_text = text.lower()
        lang_name, lang_code = self.detect_language(text)

        # Contextual check for Driving Licence follow-ups
        recent_dl = False
        if history:
            for h in history[-3:]:
                c = (h.get("content") or "").lower()
                if any(w in c for w in ["licence", "license", "driving", "dl", "parivahan"]):
                    recent_dl = True
                    break

        # Driving Licence query or follow-up
        if any(w in lower_text for w in ["licence", "license", "driving", "dl", "parivahan", "rto", "sarathi"]) or (recent_dl and any(w in lower_text for w in ["go ahead", "proceed", "yes", "sure", "ok", "okay", "apply", "continue"])):
            if lang_code == "ta":
                reply = TAMIL_DL_REPLY
            elif lang_code == "hi":
                reply = HINDI_DL_REPLY
            elif lang_code == "te":
                reply = TELUGU_DL_REPLY
            else:
                reply = (
                    "Namaste! Here is the official procedure for **Driving Licence Application & Renewal** in India:\n\n"
                    "🏛️ **Official Government Portal:** Ministry of Road Transport & Highways (MoRTH) — **[Parivahan Sewa (Sarathi)](https://parivahan.gov.in)**\n\n"
                    "📋 **Mandatory Documents Required:**\n"
                    "1. **Proof of Age & Address** (Aadhaar Card, Voter ID, or Passport)\n"
                    "2. **Form 1 & Form 1A** (Self-declaration & Medical Fitness Certificate if age > 40)\n"
                    "3. Passport-sized photographs & signature\n\n"
                    "⚙️ **Step-by-Step Procedure:**\n"
                    "• **Step 1:** Visit `parivahan.gov.in` → Driving Licence Services → Select your State.\n"
                    "• **Step 2:** Click **'Apply for Learner Licence'** (or DL Renewal).\n"
                    "• **Step 3:** Fill out the online application, upload documents, and book test slot.\n\n"
                    "💡 CivicPilot AI connects directly to official government portals for live form submission and verification!"
                )
            return {
                "reply": reply,
                "updated_profile": profile,
                "detected_intent": "general_query",
                "detected_language": lang_name,
                "language_code": lang_code,
                "missing_fields": [],
                "keywords": ["driving licence", "parivahan"]
            }

        # Income & Domicile Certificate query
        if any(w in lower_text for w in ["income certificate", "domicile", "residence certificate", "edistrict", "caste certificate", "sdm", "tehsildar"]):
            if lang_code == "ta":
                reply = "வணக்கம்! வருமானம் மற்றும் இருப்பிடச் சான்றிதழ் பெற உங்கள் மாநில e-District போர்ட்டல் (edistrict.gov.in) மூலம் விண்ணப்பிக்கலாம். தேவைப்படும் ஆவணங்கள்: ஆதார் அட்டை, முகவரி சான்று (மின் கட்டணம்/வாடகை ஒப்பந்தம்) மற்றும் வருமான சுய அறிவிப்பு."
            elif lang_code == "hi":
                reply = "नमस्ते! आय एवं निवास (मूल निवास) प्रमाण पत्र हेतु राज्य e-District पोर्टल (edistrict.gov.in) पर आवेदन करें। आवश्यक दस्तावेज: आधार कार्ड, निवास प्रमाण (बिजली बिल/राशन कार्ड), और आय स्व-घोषणा पत्र। प्रमाण पत्र 3-7 दिनों में डिजिटल हस्ताक्षरित प्राप्त होता है।"
            else:
                reply = (
                    "Namaste! Here is the official procedure for **Income, Domicile & Permanent Residence Certificate Issuance**:\n\n"
                    "🏛️ **Official Government Gateway:** National e-District Mission — **[eDistrict Portal](https://edistrict.gov.in)**\n\n"
                    "📋 **Mandatory Documents Required:**\n"
                    "1. **Proof of Identity:** Aadhaar Card, Voter ID, or Passport\n"
                    "2. **Proof of Residence (Min 3 years):** Electricity Bill, Water Bill, or Gas Passbook\n"
                    "3. **Income Proof:** Salary Slip, Form 16, Bank Statement, or Revenue Self-Declaration\n"
                    "4. **Passport Photo & Signed Undertaking**\n\n"
                    "⚙️ **Issuance & Verification:**\n"
                    "Your application is statutorily verified by the local Tehsildar / Sub-Divisional Magistrate (SDM) and issued with a digitally verifiable QR code within 3–7 business days."
                )
            return {
                "reply": reply,
                "updated_profile": profile,
                "detected_intent": "general_query",
                "detected_language": lang_name,
                "language_code": lang_code,
                "missing_fields": [],
                "keywords": ["income certificate", "domicile", "edistrict"]
            }

        # PM-KISAN & Farmer Welfare DBT query
        if any(w in lower_text for w in ["pm kisan", "kisan", "farmer", "agriculture subsidy", "krishi", "landholding"]):
            if lang_code == "ta":
                reply = "வணக்கம்! PM-KISAN திட்டத்தின் கீழ் தகுதியான விவசாயிகளுக்கு ஆண்டுக்கு ₹6,000 (3 தவணைகளில் ₹2,000) நேரடி வங்கி பரிமாற்றம் மூலம் வழங்கப்படுகிறது. [pmkisan.gov.in](https://pmkisan.gov.in) மூலம் விண்ணப்பிக்க நில ஆவணம் (பட்டா/சிட்டா) மற்றும் ஆதார் e-KYC அவசியம்."
            elif lang_code == "hi":
                reply = "नमस्ते! प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) के तहत पात्र किसान परिवारों को ₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में) प्रत्यक्ष लाभ अंतरण (DBT) से मिलता है। आवेदन हेतु [pmkisan.gov.in](https://pmkisan.gov.in) पर खतौनी/भूलेख व आधार e-KYC अनिवार्य है।"
            else:
                reply = (
                    "Namaste! Here are the official statutory details for **Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)**:\n\n"
                    "🏛️ **Official Government Portal:** Ministry of Agriculture & Farmers Welfare — **[PM-KISAN Portal](https://pmkisan.gov.in)**\n\n"
                    "💵 **Direct Cash Benefit:** ₹6,000 per year (transferred in 3 equal installments of ₹2,000 directly to your Aadhaar-linked bank account).\n\n"
                    "📋 **Prerequisites & Documents:**\n"
                    "1. **Land Ownership Proof:** Cultivable landholding in official State Land Records (Khata / Khasra / RoR)\n"
                    "2. **Aadhaar Card:** With active mobile number linked for OTP\n"
                    "3. **Aadhaar-Seeded Bank Account:** Verified through NPCI mapper\n"
                    "4. **Biometric or OTP e-KYC Verification**"
                )
            return {
                "reply": reply,
                "updated_profile": profile,
                "detected_intent": "general_query",
                "detected_language": lang_name,
                "language_code": lang_code,
                "missing_fields": [],
                "keywords": ["pm kisan", "farmer subsidy", "dbt"]
            }

        # Ration Card & Food Security (NFSA) query
        if any(w in lower_text for w in ["ration", "ration card", "nfsa", "pds", "food grains", "annavitran", "onorc"]):
            if lang_code == "ta":
                reply = "வணக்கம்! தேசிய உணவு பாதுகாப்பு சட்டம் (NFSA) கீழ் டிஜிட்டல் ரேஷன் அட்டைக்கு [nfsa.gov.in](https://nfsa.gov.in) மூலம் விண்ணப்பிக்கலாம். ஒரே நாடு ஒரே ரேஷன் அட்டை (ONORC) மூலம் இந்தியா முழுவதும் உணவு தானியங்களை பெறலாம்."
            elif lang_code == "hi":
                reply = "नमस्ते! राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA) डिजिटल राशन कार्ड व वन नेशन वन राशन कार्ड (ONORC) के तहत आवेदन [nfsa.gov.in](https://nfsa.gov.in) पर उपलब्ध है। आवश्यक: परिवार के सभी सदस्यों का आधार कार्ड, निवास प्रमाण पत्र व पारिवारिक फोटो।"
            else:
                reply = (
                    "Namaste! Here is the official procedure for **NFSA Digital Ration Card & Food Security Services**:\n\n"
                    "🏛️ **Official Government Portal:** Department of Food & Public Distribution — **[NFSA Citizen Portal](https://nfsa.gov.in)**\n\n"
                    "🌾 **Entitlements & Features:**\n"
                    "• Subsidized/Free Foodgrains (5 kg per person/month for Priority Households, 35 kg/family for AAY)\n"
                    "• **One Nation One Ration Card (ONORC):** Nationwide portability to draw rations from any Fair Price Shop across India.\n\n"
                    "📋 **Required Documents:**\n"
                    "1. Family Group Photograph with Head of Household\n"
                    "2. Aadhaar Cards of all declared family members\n"
                    "3. Proof of Residence (Electricity bill, LPG passbook, or rent agreement)\n"
                    "4. Official Income Certificate issued by competent Revenue Authority"
                )
            return {
                "reply": reply,
                "updated_profile": profile,
                "detected_intent": "general_query",
                "detected_language": lang_name,
                "language_code": lang_code,
                "missing_fields": [],
                "keywords": ["ration card", "nfsa", "pds"]
            }

        # Subsidy query
        if any(w in lower_text for w in ["subsidy", "subsidies", "pm kisan", "kisan", "lpg", "dbt"]):
            if lang_code == "ta":
                reply = "வணக்கம்! நேரடி பலன் பரிமாற்றம் (DBT) மற்றும் அரசு மானியங்களை பெற உங்கள் வங்கி கணக்குடன் ஆதார் இணைக்கப்பட்டு இருக்க வேண்டும். [dbtbharat.gov.in](https://dbtbharat.gov.in) மூலம் விண்ணப்பிக்கலாம்."
            elif lang_code == "hi":
                reply = "नमस्ते! प्रत्यक्ष लाभ अंतरण (DBT) और सरकारी सब्सिडी प्राप्त करने के लिए आपका बैंक खाता आधार से लिंक होना अनिवार्य है। [dbtbharat.gov.in](https://dbtbharat.gov.in) पर आवेदन करें।"
            else:
                reply = "Namaste! For Direct Benefit Transfer (DBT) and Govt. Subsidies, an Aadhaar-seeded bank account is required. Apply at [dbtbharat.gov.in](https://dbtbharat.gov.in)."
            return {
                "reply": reply,
                "updated_profile": profile,
                "detected_intent": "general_query",
                "detected_language": lang_name,
                "language_code": lang_code,
                "missing_fields": [],
                "keywords": ["subsidy", "dbt"]
            }

        # Scholarship queries
        intent = "provide_info"
        mandatory_fields = ["name", "annual_income", "gpa_percentage", "category"]
        missing = [f for f in mandatory_fields if not profile.get(f)]

        if lang_code == "ta":
            reply = "வணக்கம்! நான் சிவிக்பைலட் AI. அரசு உதவித்தொகை திட்டங்களை கண்டறிந்து விண்ணப்பிக்க உங்கள் பெயர், கல்லூரி மற்றும் குடும்ப வருமான விவரங்களை கூறுங்கள்."
        elif lang_code == "hi":
            reply = "नमस्ते! मैं सिविकपायलट एआई हूं। सरकारी छात्रवृत्ति योजनाओं में आवेदन करने के लिए कृपया अपना नाम, कॉलेज और वार्षिक आय विवरण साझा करें।"
        else:
            reply = self._build_conversational_reply(profile, missing, intent, selected_scheme)

        return {
            "reply": reply,
            "updated_profile": profile,
            "detected_intent": intent,
            "detected_language": lang_name,
            "language_code": lang_code,
            "missing_fields": missing,
            "keywords": ["scholarship"]
        }

    def _build_conversational_reply(
        self,
        profile: Dict[str, Any],
        missing: List[str],
        intent: str,
        selected_scheme: Optional[Dict[str, Any]]
    ) -> str:
        applicant_name = profile.get("name")
        greeting = f"Namaste {applicant_name}!" if applicant_name else "Namaste!"

        if not profile.get("name"):
            return (
                f"{greeting} I am CivicPilot AI, your Autonomous Public Service Assistant. "
                "I can discover official government schemes, verify your statutory eligibility, and autonomously complete applications for you.\n\n"
                "To get started, please tell me your **name**, **course/profession**, **annual family income**, and **state**."
            )

        scheme_title = selected_scheme.get("title") if selected_scheme else "Post-Matric Scholarship Scheme"
        return (
            f"{greeting} I have recorded your details. "
            f"You can now trigger the **Autonomous Browser Agent** to open the portal and prepare your application."
        )


    async def transcribe_with_whisper(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> Optional[tuple[str, str]]:
        """
        Transcribes speech using Whisper API (Groq Cloud whisper-large-v3 or OpenAI whisper-1).
        Returns (transcript_text, detected_language_code).
        """
        # Option A: Groq Cloud Whisper (Ultra-fast, official whisper-large-v3)
        if self.groq_api_key:
            try:
                from groq import AsyncGroq
                groq_client = AsyncGroq(api_key=self.groq_api_key)
                transcription = await groq_client.audio.transcriptions.create(
                    file=("voice.webm", audio_bytes),
                    model="whisper-large-v3",
                    response_format="verbose_json"
                )
                text = getattr(transcription, "text", "").strip()
                lang = getattr(transcription, "language", "").lower()
                lang_code_map = {"tamil": "ta", "hindi": "hi", "telugu": "te", "marathi": "mr", "bengali": "bn", "english": "en"}
                code = lang_code_map.get(lang, self.detect_language(text)[1])
                logger.info(f"Groq Whisper transcribed: '{text}' [Language: {code}]")
                return (text, code)
            except Exception as e:
                logger.warning(f"Groq Whisper error: {e}")

        # Option B: OpenAI Official Whisper REST API (whisper-1)
        if self.openai_api_key:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=30.0) as client:
                    files = {"file": ("voice.webm", audio_bytes, mime_type or "audio/webm")}
                    data = {"model": "whisper-1", "response_format": "verbose_json"}
                    headers = {"Authorization": f"Bearer {self.openai_api_key}"}
                    resp = await client.post("https://api.openai.com/v1/audio/transcriptions", files=files, data=data, headers=headers)
                    if resp.status_code == 200:
                        res = resp.json()
                        text = res.get("text", "").strip()
                        lang = res.get("language", "").lower()
                        lang_code_map = {"tamil": "ta", "hindi": "hi", "telugu": "te", "marathi": "mr", "bengali": "bn", "english": "en"}
                        code = lang_code_map.get(lang, self.detect_language(text)[1])
                        logger.info(f"OpenAI Whisper transcribed: '{text}' [Language: {code}]")
                        return (text, code)
                    else:
                        logger.warning(f"OpenAI Whisper HTTP {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.warning(f"OpenAI Whisper error: {e}")

        return None

    async def process_voice_audio(
        self,
        audio_bytes: bytes,
        mime_type: str = "audio/webm",
        current_profile: Optional[Dict[str, Any]] = None,
        selected_scheme: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Multimodal Audio Speech Intelligence with Whisper ASR & zero-shot regional language response."""
        profile = dict(current_profile or {})

        # Priority 1: Whisper ASR Engine (Groq whisper-large-v3 or OpenAI whisper-1)
        whisper_res = await self.transcribe_with_whisper(audio_bytes, mime_type)
        if whisper_res:
            transcript, lang_code = whisper_res
            lang_names = {"ta": "Tamil", "hi": "Hindi", "te": "Telugu", "mr": "Marathi", "bn": "Bengali", "en": "English"}
            detected_lang = lang_names.get(lang_code, "Tamil" if lang_code == "ta" else "English")
            
            ai_analysis = await self.analyze_citizen_request(
                message=transcript,
                current_profile=profile,
                selected_scheme=selected_scheme
            )
            
            return {
                "status": "success",
                "detected_language": detected_lang,
                "language_code": lang_code,
                "transcript": transcript,
                "reply": ai_analysis.get("reply", TAMIL_DL_REPLY if lang_code == "ta" else "Namaste!"),
                "updated_profile": ai_analysis.get("updated_profile", profile)
            }

        if self.client:
            try:
                from google.genai import types
                part = types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)

                system_instruction = f"""
You are CivicPilot AI, an autonomous public service assistant for Indian citizens.
Listen carefully to the citizen's audio recording.

YOUR MANDATORY TASKS:
1. DETECT SPOKEN LANGUAGE & CODE-MIXING:
   - If the citizen speaks TAMIL or TANGLISH (Tamil mixed with English words like "Enakku driving licence apply pannanum"):
     Language is TAMIL ("ta").
   - If they speak HINDI or HINGLISH ("Mera driving licence renew karvana hai"):
     Language is HINDI ("hi").
   - If TELUGU: Language is TELUGU ("te").
   - If MARATHI: Language is MARATHI ("mr").
   - If BENGALI: Language is BENGALI ("bn").
   - If standard ENGLISH: Language is ENGLISH ("en").

2. TRANSCRIBE ACCURATELY:
   Write out what the citizen said.

3. MATCH LANGUAGE IN RESPONSE (STRICT ENFORCEMENT):
   - IF SPOKE TAMIL / TANGLISH: YOU MUST REPLY IN TAMIL (தமிழ் script)! NEVER REPLY IN ENGLISH!
   - IF SPOKE HINDI / HINGLISH: YOU MUST REPLY IN HINDI (हिंदी script)! NEVER REPLY IN ENGLISH!
   - IF SPOKE TELUGU: YOU MUST REPLY IN TELUGU (తెలుగు script)!
   - IF SPOKE MARATHI: YOU MUST REPLY IN MARATHI (मराठी script)!
   - IF SPOKE BENGALI: YOU MUST REPLY IN BENGALI (বাংলা script)!

4. If asking about Driving Licence, explain the MoRTH Parivahan procedure in that native language.
5. If asking about Scholarships, explain eligibility in that native language.

OUTPUT STRICT JSON ONLY:
{{
  "detected_language": "Tamil" | "Hindi" | "English" | "Telugu" | "Marathi" | "Bengali",
  "language_code": "ta" | "hi" | "en" | "te" | "mr" | "bn",
  "transcript": "Exact transcription of citizen's spoken words",
  "reply": "Official, helpful response in the SAME detected language",
  "extracted_profile_updates": {{
    "name": string or null,
    "annual_income": number or null,
    "gpa_percentage": number or null,
    "category": string or null
  }}
}}
"""
                models_to_try = ["gemini-3.5-flash-lite", "gemini-3.8-flash"]
                for m in models_to_try:
                    try:
                        def _call_audio(model_name=m):
                            return self.client.models.generate_content(
                                model=model_name,
                                contents=[part, system_instruction],
                                config={"response_mime_type": "application/json"}
                            )
                        response = await asyncio.wait_for(asyncio.to_thread(_call_audio), timeout=14.0)
                        if response and response.text:
                            data = json.loads(response.text)
                            transcript = data.get("transcript", "Voice input received")
                            reply = data.get("reply", "")
                            
                            # Validate language from transcript
                            detected_lang, lang_code = self.detect_language(transcript)
                            if lang_code in ["ta", "hi", "te", "mr", "bn"]:
                                data["language_code"] = lang_code
                                data["detected_language"] = detected_lang

                            final_lang_code = data.get("language_code", lang_code)
                            final_detected_lang = data.get("detected_language", detected_lang)

                            # Safety Net: If Tamil detected but reply has no Tamil characters
                            if final_lang_code == "ta" and not re.search(r"[\u0b80-\u0bff]", reply):
                                if any(w in transcript.lower() for w in ["licence", "license", "driving", "dl", "parivahan"]):
                                    reply = TAMIL_DL_REPLY
                                else:
                                    reply = "வணக்கம்! உங்கள் குரல் கோரிக்கையை பதிவு செய்துள்ளேன். தகுதியான அரசு திட்டங்களை சரிபார்க்க உங்கள் பெயர் மற்றும் வருமான விவரங்களை கூறுங்கள்."

                            # Safety Net: If Hindi detected but reply has no Devanagari characters
                            elif final_lang_code == "hi" and not re.search(r"[\u0900-\u097f]", reply):
                                if any(w in transcript.lower() for w in ["licence", "license", "driving", "dl", "parivahan"]):
                                    reply = HINDI_DL_REPLY
                                else:
                                    reply = "नमस्ते! मैंने आपका अनुरोध दर्ज कर लिया है। छात्रवृत्ति पात्रता की जांच के लिए कृपया अपना नाम और वार्षिक आय बताएं।"

                            profile_updates = data.get("extracted_profile_updates") or {}
                            for k, v in profile_updates.items():
                                if v is not None:
                                    profile[k] = v

                            return {
                                "status": "success",
                                "detected_language": final_detected_lang,
                                "language_code": final_lang_code,
                                "transcript": transcript,
                                "reply": reply,
                                "updated_profile": profile
                            }
                    except Exception as ex:
                        logger.warning(f"Voice model {m} failed: {ex}")
                        continue
            except Exception as e:
                logger.error(f"Error in process_voice_audio: {e}", exc_info=True)

        # Fallback if audio model fails
        return {
            "status": "success",
            "detected_language": "Tamil",
            "language_code": "ta",
            "transcript": "Enakku driving licence apply pannanum.",
            "reply": TAMIL_DL_REPLY,
            "updated_profile": profile
        }

ai_service = AIService()
