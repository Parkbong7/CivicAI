import os
import sys
import asyncio
import logging
from contextlib import asynccontextmanager

# Ensure Windows uses ProactorEventLoop for Playwright subprocess compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

def proactor_loop_factory():
    loop = asyncio.ProactorEventLoop()
    asyncio.set_event_loop(loop)
    return loop

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("civicpilot")

from database.connection import init_db
from routes import chat_router, services_router, applications_router, automation_router, auth_router, documents_router
from automation.browser_service import SCREENSHOTS_DIR

DEMO_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo_static")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CivicPilot AI Database...")
    init_db()
    logger.info("CivicPilot AI Services Ready.")
    yield
    logger.info("CivicPilot AI Services Shutting Down...")

app = FastAPI(
    title="CivicPilot AI - Autonomous Public Service Agent API",
    description="Backend API powering CivicPilot AI: AI Request Understanding, Government Portal Discovery, Eligibility Verification, and Playwright Autonomous Browser Automation.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Screenshots Static Directory
app.mount("/screenshots", StaticFiles(directory=SCREENSHOTS_DIR), name="screenshots")

# Serve Demo Scholarship Portal
@app.get("/demo-portal")
async def serve_demo_portal():
    html_path = os.path.join(DEMO_STATIC_DIR, "portal.html")
    return FileResponse(html_path)

# Include API Routers
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(services_router)
app.include_router(applications_router)
app.include_router(automation_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CivicPilot AI Backend",
        "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY")),
        "database": "SQLite active",
        "browser_engine": "Playwright ready (Chrome/Edge)"
    }

# Check for production frontend build (static_dist or frontend/dist)
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static_dist")
if not os.path.exists(FRONTEND_DIST):
    FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

if os.path.exists(FRONTEND_DIST) and os.path.isfile(os.path.join(FRONTEND_DIST, "index.html")):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend_assets")

    @app.get("/")
    async def root_or_spa(request: Request):
        accept_header = request.headers.get("accept", "")
        # Standard web browsers always send 'text/html' in Accept header
        if "text/html" in accept_header:
            return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
        # Programmatic API clients and automated tests receive JSON metadata
        return {
            "name": "CivicPilot AI",
            "description": "Autonomous Public Service Agent for Government Services",
            "portal_url": "https://scholarships.gov.in",
            "health_check": "http://127.0.0.1:8000/api/health"
        }

    @app.get("/{full_path:path}")
    async def serve_spa_paths(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("screenshots/") or full_path == "demo-portal":
            raise HTTPException(status_code=404, detail="Not Found")
        target_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "name": "CivicPilot AI",
            "description": "Autonomous Public Service Agent for Government Services",
            "portal_url": "https://scholarships.gov.in",
            "health_check": "http://127.0.0.1:8000/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, loop="main:proactor_loop_factory", reload=True)
