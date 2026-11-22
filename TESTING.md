# CIVICPILOT AI – TESTING GUIDE & SUITE DOCUMENTATION

This document provides instructions for executing the complete test suite for CivicPilot AI across all layers of the application.

---

## 1. Prerequisites

Ensure Python 3.11+ and Node.js 18+ are installed.

```bash
# Backend dependencies
pip install pytest pytest-asyncio httpx playwright aiosqlite
playwright install chromium

# Frontend dependencies
cd frontend
npm install
```

---

## 2. Running Frontend Unit Tests (Vitest)

Executes all 26 React component and widget unit tests:

```bash
cd frontend
npx vitest run
```

### Test Coverage:
- `EligibilityGaugeWidget.test.jsx`: Statutory Eligibility radial progress gauge and qualification status.
- `ExecutionTimelineWidget.test.jsx`: 12-stage live execution timeline and status updates.
- `AvailableServicesAndPreview.test.jsx`: Quick services cards, preview modal, editing, review confirmation.
- `TopHeaderSidebarCatalog.test.jsx`: Header language dropdown, sidebar navigation, services catalog filtering.
- `ChatSectionAndTracking.test.jsx`: Chat message interaction, clear chat trigger, OCR scanner button, applications tracking.

---

## 3. Running Backend Unit Tests (pytest)

Executes all 30 backend unit tests covering AI service, Eligibility Engine, Application Service, and Agent Controller:

```bash
# From project root
python -m pytest backend/tests/test_ai_service.py -v
python -m pytest backend/tests/test_eligibility_service.py -v
python -m pytest backend/tests/test_application_service.py -v
python -m pytest backend/tests/test_agent_controller.py -v
```

---

## 4. Running API Integration Tests

Tests all FastAPI routes, CORS middleware, schema validation, and database queries:

```bash
python -m pytest backend/tests/test_api_integration.py -v
```

---

## 5. Running Playwright Browser Automation Tests

Launches actual headless Chromium to interact with the demo scholarship portal:

```bash
python -m pytest backend/tests/test_playwright_automation.py -v
```

---

## 6. Running End-to-End (E2E) Scenarios (TC-1 to TC-6)

Executes the complete user journeys:

```bash
python -m pytest backend/tests/test_e2e_scenarios.py -v
```

- **TC-1:** Successful Scholarship Application (Chat -> Eligibility -> Automation -> Review -> Submit -> Receipt).
- **TC-2:** Ineligible Applicant (Income ceiling exceeded -> blocked from submission).
- **TC-3:** Missing Information (AI prompts follow-up questions).
- **TC-4:** User Rejection (Citizen declines preview -> submission halted).
- **TC-5:** Browser Failure (Simulated navigation failure handled safely).
- **TC-6:** Application Tracking (Persistence verified in SQLite).

---

## 7. Running Security & Vulnerability Audit

```bash
python -m pytest backend/tests/test_security_audit.py -v
```

Verifies:
- No Gemini API keys or credentials bundled in frontend source.
- Sensitive files protected by `.gitignore`.
- SQL injection safety across all endpoints.
- User approval gatekeeper cannot be bypassed.
- Directory traversal attacks are deflected.

---

## 8. Running UI Responsiveness & Performance Tests

```bash
python -m pytest backend/tests/test_ui_and_performance.py -v
```

Verifies:
- Desktop (1280x800), Tablet (768x1024), and Mobile (375x667) layouts.
- Zero horizontal overflow (`scrollWidth <= window.innerWidth`).
- API latencies and database query response times.

---

## 9. Running Full Regression Test Suite

To run all backend test suites in a single command:

```bash
python -m pytest backend/tests -v
```

**Result:** 60 passed in ~73s.
