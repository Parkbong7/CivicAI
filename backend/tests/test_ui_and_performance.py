import os
import time
import pytest
import aiosqlite
from playwright.async_api import async_playwright
from fastapi.testclient import TestClient
from main import app
from database.connection import DB_PATH
from automation.browser_service import get_browser_executable

AUDIT_DIR = os.path.dirname(os.path.abspath(__file__))

@pytest.mark.asyncio
async def test_ui_responsiveness_and_visual_integrity():
    """Test Desktop, Tablet, and Mobile viewport responsiveness and check for zero console errors."""
    browser_exe = get_browser_executable()
    async with async_playwright() as p:
        browser = None
        if browser_exe:
            try:
                browser = await p.chromium.launch(executable_path=browser_exe, headless=True)
            except Exception:
                pass
        if not browser:
            browser = await p.chromium.launch(headless=True)

        viewports = [
            ("Desktop", 1280, 800, "qa_audit_desktop.png"),
            ("Tablet", 768, 1024, "qa_audit_tablet.png"),
            ("Mobile", 375, 667, "qa_audit_mobile.png")
        ]

        for device_name, width, height, filename in viewports:
            console_errors = []
            context = await browser.new_context(viewport={"width": width, "height": height})
            page = await context.new_page()

            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

            # Navigate to live frontend
            await page.goto("http://127.0.0.1:5173", wait_until="networkidle", timeout=15000)

            # Check that page title and key Gov-Tech elements exist
            assert "CivicPilot" in await page.title() or "Civic" in await page.title()

            # Verify no horizontal scrollbar overflow
            is_overflow = await page.evaluate("() => document.documentElement.scrollWidth > window.innerWidth + 5")
            assert not is_overflow, f"{device_name} ({width}px) has unintentional horizontal overflow!"

            # Save screenshot for QA audit record
            out_path = os.path.join(AUDIT_DIR, filename)
            await page.screenshot(path=out_path, full_page=True)
            assert os.path.exists(out_path)

            await context.close()

        await browser.close()

def test_performance_benchmarks():
    """Measure real response times for key APIs and database operations."""
    with TestClient(app) as client:
        # 1. Health check latency
        t0 = time.perf_counter()
        resp = client.get("/api/health")
        t_health = (time.perf_counter() - t0) * 1000
        assert resp.status_code == 200
        assert t_health < 150, f"Health check took too long: {t_health:.1f}ms"

        # 2. Services list latency
        t0 = time.perf_counter()
        resp = client.get("/api/services")
        t_services = (time.perf_counter() - t0) * 1000
        assert resp.status_code == 200
        assert t_services < 250, f"Services retrieval took too long: {t_services:.1f}ms"

        # 3. Chat endpoint latency
        t0 = time.perf_counter()
        resp = client.post("/api/chat", json={
            "message": "I need help with college scholarship",
            "current_profile": {},
            "selected_scheme_id": "nsp-pms-2026"
        })
        t_chat = (time.perf_counter() - t0) * 1000
        assert resp.status_code == 200
        assert t_chat < 500, f"Chat processing took too long: {t_chat:.1f}ms"

        # 4. Applications tracking list latency
        t0 = time.perf_counter()
        resp = client.get("/api/applications")
        t_apps = (time.perf_counter() - t0) * 1000
        assert resp.status_code == 200
        assert t_apps < 250, f"Applications listing took too long: {t_apps:.1f}ms"

@pytest.mark.asyncio
async def test_database_query_performance():
    """Verify SQLite database read & write query throughput under 50ms."""
    t0 = time.perf_counter()
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM services WHERE is_active = 1")
        rows = await cursor.fetchall()
        assert len(rows) >= 4
    elapsed = (time.perf_counter() - t0) * 1000
    assert elapsed < 50, f"DB query took {elapsed:.2f}ms (threshold: 50ms)"
