# CIVICPILOT AI
## Autonomous Public Service Agent – Hackathon Edition

**CivicPilot AI** is an AI-powered Autonomous Public Service Agent that helps citizens discover, understand, verify eligibility for, and autonomously complete government service and scholarship applications online.

---

## 🌟 Core Architecture & Capabilities

1. **AI Conversational Assistant (Gemini + Gov-Tech NLP Engine)**
   - Accepts natural language requests from citizens (e.g. *"I am a college student. I want to find and apply for a scholarship."*).
   - Dynamically extracts 12+ structured applicant parameters (legal name, college, degree, CGPA, family income, category, DBT account).
   - Maintains multi-turn context and prompts for missing mandatory information.

2. **Statutory Eligibility Verification Engine**
   - Automatically compares applicant parameters against official government thresholds.
   - Verifies annual family income ceilings (e.g. $\le$ ₹2.5 Lakhs), academic merit marks, gender stipulations, and accredited college enrollment.
   - Provides clear itemized checklist explaining why an applicant qualifies or what is missing.

3. **Playwright Autonomous Browser Agent**
   - Launches native Chrome / Microsoft Edge browsers.
   - Connects to application portals, maps DOM form fields, enters personal, academic, and financial information.
   - Streams live browser viewport screenshots directly to the dashboard in real-time with action logs.

4. **Human-in-the-Loop Safety Gatekeeper (Explicit Citizen Approval)**
   - **Mandatory Safety Rule:** The browser agent automatically pauses at **Stage 10 (Waiting for User Approval)**.
   - Displays an editable application preview allowing citizens to inspect and modify any field.
   - Never performs submission without explicit citizen authorization.

5. **Dual Execution Modes**
   - **Mode 1 (Live Government Website Mode):** Playwright navigates official public government portals (e.g. National Scholarship Portal `https://scholarships.gov.in`), extracts real live announcements, eligibility guidelines, and required documents.
   - **Mode 2 (Autonomous Demo Application Mode):** Locally hosted scholarship portal (`http://127.0.0.1:8000/demo-portal`) supporting the complete end-to-end autonomous form-filling, verification, and receipt issuance workflow.

6. **SQLite Persistent Tracking & Verifiable Digital Receipts**
   - Generates official submission reference codes (e.g. `NSP-DEMO-905967`).
   - Persists all drafted and submitted applications in `civicpilot.db`.
   - Generates printable/downloadable digital receipts complete with digital hash signatures.

---

## 🚀 12-Stage Agent Execution Timeline

CivicPilot AI visualizes every single step of the autonomous agent lifecycle:

1. `UNDERSTANDING_REQUEST` – AI natural language understanding parsing citizen intent.
2. `DISCOVERING_SERVICE` – Searching and selecting matching government scheme.
3. `EXTRACTING_REQUIREMENTS` – Parsing statutory eligibility rules and required certificates.
4. `COLLECTING_APPLICANT_INFO` – Extracting structured citizen profile parameters.
5. `CHECKING_ELIGIBILITY` – Evaluating applicant criteria against statutory thresholds.
6. `OPENING_APPLICATION_PORTAL` – Playwright launching browser and navigating to portal.
7. `MAPPING_FORM_FIELDS` – Detecting DOM selectors and mapping applicant schema.
8. `FILLING_APPLICATION` – Autonomously entering personal, academic, and financial data.
9. `VERIFYING_INFORMATION` – Validating DOM inputs and executing client error checks.
10. `WAITING_FOR_USER_APPROVAL` – **[GATEKEEPER]** Paused for explicit citizen confirmation.
11. `SUBMITTING_APPLICATION` – Transmitting verified application to scholarship portal.
12. `GENERATING_RECEIPT` – Generating verifiable digital receipt and reference number.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 (Modern Gov-Tech Aesthetic) |
| **Icons** | Lucide React |
| **API Client** | Axios |
| **Backend** | Python 3.13 + FastAPI |
| **Browser Engine** | Playwright (Chromium / Chrome / Edge) |
| **AI Engine** | Google Gemini (`google-genai`) + Smart Fallback NLP |
| **Database** | SQLite (`aiosqlite`) |

---

## 🏃 Quick Start Guide

### Step 1: Start Backend Server
Open a terminal in `C:\Users\acer\Desktop\CivicAI` and run:
```powershell
.\run_backend.bat
```
*Or manually:*
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- FastAPI Backend: `http://127.0.0.1:8000`
- API Health Check: `http://127.0.0.1:8000/api/health`
- Local Demo Scholarship Portal: `http://127.0.0.1:8000/demo-portal`

### Step 2: Start Frontend Application
In a second terminal, run:
```powershell
.\run_frontend.bat
```
*Or manually:*
```powershell
cd frontend
npm run dev
```
- Dashboard URL: `http://localhost:5173`

---

## 🎯 Final Demonstration Walkthrough

1. Open `http://localhost:5173` in your browser.
2. In the AI Conversational Assistant on the left, type:
   > *"I am a college student. I want to find and apply for a scholarship."*
3. The AI prompts for details, or click the **"Test Persona: Priya Sharma"** button in the top navigation bar to populate a verified college student profile (Delhi Technological University, 8.6 CGPA, ₹1.8L income, OBC).
4. Watch the **Eligibility Verification Engine** update in real-time with green checkmarks confirming statutory qualification.
5. Click **"Run Playwright Agent"**.
6. Observe the **Playwright Live Viewport** as the browser navigates the scholarship portal and autonomously fills all fields step-by-step.
7. The agent automatically halts at **Stage 10 (Waiting for User Approval)** and opens the **Citizen Review Gatekeeper**.
8. Review or edit the entered values and click **"Approve & Submit Application"**.
9. The Playwright agent triggers the final submission, extracts the generated reference number (e.g. `NSP-DEMO-905967`), and displays the official verifiable receipt.
10. Switch to **"My Applications"** tab to view the persisted SQLite audit record.
11. Switch to **"Live Portal Discovery"** tab to run Mode 1 Playwright web intelligence on official government websites (`https://scholarships.gov.in`).
