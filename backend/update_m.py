with open(r"C:\Users\acer\Desktop\CivicAI\backend\services\ai_service.py", "r", encoding="utf-8") as f:
    text = f.read()

old_models = 'models_to_try = ["gemini-3.8-flash", "gemini-2.5-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash"]'
new_models = 'models_to_try = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"]'

if old_models in text:
    text = text.replace(old_models, new_models)
    print("Replaced models list")

with open(r"C:\Users\acer\Desktop\CivicAI\backend\services\ai_service.py", "w", encoding="utf-8") as f:
    f.write(text)
