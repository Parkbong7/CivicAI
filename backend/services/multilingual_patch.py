# -*- coding: utf-8 -*-
import sys

file_path = r"C:\Users\acer\Desktop\CivicAI\backend\services\ai_service.py"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add detect_language static method to AIService class
detect_language_method = '''
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
        tamil_script = re.search(r"[\\u0b80-\\u0bff]", text)
        tanglish_words = [
            "enakku", "pannanum", "vendum", "solunga", "eppadi", "pannunga",
            "venum", "kudunga", "theriyala", "vanakkam", "ungalluku", "nalla",
            "illai", "edhukku", "dhan", "irukku", "kedaikkuma", "podanum", "panradhu"
        ]
        if tamil_script or any(w in lower for w in tanglish_words):
            return ("Tamil", "ta")
        
        # 2. Check for Telugu script or Teluglish vocabulary
        telugu_script = re.search(r"[\\u0c00-\\u0c7f]", text)
        telugu_words = ["naku", "kavali", "cheyali", "ela", "cheppandi", "namaskaram"]
        if telugu_script or any(w in lower for w in telugu_words):
            return ("Telugu", "te")

        # 3. Check for Marathi markers
        marathi_markers = ["mala", "pahije", "karaycha", "ahe", "sanga"]
        if any(w in lower for w in marathi_markers):
            return ("Marathi", "mr")

        # 4. Check for Hindi / Devanagari script or Hinglish vocabulary
        devanagari_script = re.search(r"[\\u0900-\\u097f]", text)
        hinglish_words = [
            "mujhe", "chahiye", "karna hai", "karo", "batao", "kaisa", "kaise",
            "mera", "meri", "karvana", "hoga", "nahi", "namaste", "aapka", "kripya", "bataiye"
        ]
        if devanagari_script or any(w in lower for w in hinglish_words):
            return ("Hindi", "hi")
        
        # 5. Check for Bengali script or Bengali vocabulary
        bengali_script = re.search(r"[\\u0980-\\u09ff]", text)
        bengali_words = ["amar", "dorkar", "korte hobe", "bolun", "nomoshkar"]
        if bengali_script or any(w in lower for w in bengali_words):
            return ("Bengali", "bn")
        
        return ("English", "en")
'''

# 2. Pre-translated official Gov-Tech responses for safety fallback
helper_responses = '''
TAMIL_DL_REPLY = (
    "வணக்கம்! இந்தியாவில் **ஓட்டுநர் உரிமம் (Driving Licence) விண்ணப்பிப்பதற்கான** அதிகாரப்பூர்வ வழிமுறைகள்:\\n\\n"
    "🏛️ **அதிகாரப்பூர்வ அரசு தளம்:** சாலைப் போக்குவரத்து மற்றும் நெடுஞ்சாலைகள் அமைச்சகம் (MoRTH) — **[பரிவாஹன் போர்ட்டல் (parivahan.gov.in)](https://parivahan.gov.in)**\\n\\n"
    "📋 **தேவையான முக்கிய ஆவணங்கள்:**\\n"
    "1. **வயது மற்றும் முகவரி சான்று** (ஆதார் அட்டை, வாக்காளர் அட்டை, அல்லது பாஸ்போர்ட்)\\n"
    "2. **படிவம் 1 மற்றும் படிவம் 1A** (மருத்துவ உடற்தகுதி சான்றிதழ்)\\n"
    "3. பாஸ்போர்ட் அளவு புகைப்படங்கள் மற்றும் கையொப்பம்\\n\\n"
    "⚙️ **விண்ணப்பிக்கும் படிகள்:**\\n"
    "• **படி 1:** `parivahan.gov.in` தளத்திற்குச் சென்று 'Drivers/Learners Licence' என்பதைத் தேர்ந்தெடுக்கவும்.\\n"
    "• **படி 2:** உங்கள் மாநிலத்தைத் தேர்ந்தெடுத்து 'Apply for Learner Licence' என்பதைக் கிளிக் செய்யவும்.\\n"
    "• **படி 3:** விவரங்களை நிரப்பி, ஆவணங்களை பதிவேற்றம் செய்து, கட்டணம் செலுத்தவும்.\\n"
    "• **படி 4:** ஆன்லைன் கற்றல் தேர்வை எழுதி தேர்ச்சி பெற்ற 30 நாட்களுக்குப் பிறகு நிரந்தர ஓட்டுநர் உரிமத்திற்கு விண்ணப்பிக்கலாம்.\\n\\n"
    "💡 *குறிப்பு:* ஹேக்கத்தான் செயல்விளக்கத்திற்காக எங்கள் தன்னாட்சி Playwright உலாவி தற்போது தேசிய உதவித்தொகை தளத்தில் இயங்குகிறது. உங்களுக்கு மேலும் உதவி தேவையா?"
)

HINDI_DL_REPLY = (
    "नमस्ते! भारत में **ड्राइविंग लाइसेंस (Driving Licence) आवेदन** करने की आधिकारिक प्रक्रिया:\\n\\n"
    "🏛️ **आधिकारिक सरकारी पोर्टल:** सड़क परिवहन और राजमार्ग मंत्रालय (MoRTH) — **[परिवहन सेवा (parivahan.gov.in)](https://parivahan.gov.in)**\\n\\n"
    "📋 **आवश्यक दस्तावेज:**\\n"
    "1. **आयु एवं निवास प्रमाण पत्र** (आधार कार्ड, वोटर आईडी)\\n"
    "2. **फॉर्म 1 एवं फॉर्म 1A** (चिकित्सा प्रमाण पत्र यदि 40 वर्ष से अधिक हो)\\n"
    "3. पासपोर्ट साइज फोटो और हस्ताक्षर\\n\\n"
    "⚙️ **आवेदन प्रक्रिया:**\\n"
    "• **चरण 1:** `parivahan.gov.in` पर जाएं और अपना राज्य चुनें।\\n"
    "• **चरण 2:** 'Apply for Learner Licence' पर क्लिक करें।\\n"
    "• **चरण 3:** फॉर्म भरें, दस्तावेज अपलोड करें और ऑनलाइन स्लॉट बुक करें।\\n\\n"
    "💡 *नोट:* हैकाथॉन डेमो के लिए हमारा स्वायत्त ब्राउज़र एजेंट राष्ट्रीय छात्रवृत्ति पोर्टल पर दिखाया गया है।"
)
'''

print("Helper definitions prepared.")
