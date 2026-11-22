# CIVICPILOT AI – ONE-CLICK RAILWAY DEPLOYMENT GUIDE

**Yes! You can deploy both Frontend and Backend together in one single go on Railway.**

We have pre-configured a **Multi-Stage Dockerfile** and a `railway.json` file in the root of your project:
- **Stage 1 (Node.js 20):** Builds the React SPA (`npm run build`) into production static assets.
- **Stage 2 (Playwright Python Runner):** Uses Microsoft's official Playwright container with Chromium pre-installed, embeds the frontend into FastAPI, and runs both on a single port.
- **Zero CORS issues:** Both UI and API share the exact same domain.
- **Single Service:** You only run and pay for 1 service on Railway.

---

## Step-by-Step Deployment Instructions

### Step 1: Push your Code to GitHub

If you haven't initialized Git yet, run:

```bash
cd C:\Users\acer\Desktop\CivicAI
git init
git add .
git commit -m "feat: complete CivicPilot AI ready for Railway deployment"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/CivicAI.git
git push -u origin main
```

*(Note: Your `.env`, `node_modules`, and local test databases are already automatically protected by `.gitignore`)*

---

### Step 2: Open Railway and Deploy from GitHub

1. Go to **[railway.app](https://railway.app)** and log in with your GitHub account.
2. Click **"+ New Project"** -> Select **"Deploy from GitHub repo"**.
3. Select your **`CivicAI`** repository.
4. Click **"Deploy Now"**.

Railway will automatically detect the root `Dockerfile` and start the multi-stage build:
- It compiles the React Vite frontend in ~30 seconds.
- It pulls the Playwright container and installs backend requirements.
- It launches FastAPI with Uvicorn on Railway's dynamic `$PORT`.

---

### Step 3: Add Environment Variables

In your Railway project dashboard:
1. Click on your newly created service.
2. Navigate to the **"Variables"** tab.
3. Click **"+ New Variable"** and add:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` *(Your Google Gemini API Key)* | Multilingual reasoning & scheme discovery |
| `HEADLESS` | `true` | Runs Playwright Chromium headlessly |
| `GROQ_API_KEY` | *(Optional)* | Fast multimodal voice Whisper transcription |

*(Railway will automatically redeploy with the new variables within seconds)*

---

### Step 4: Add Persistent Storage for SQLite (Crucial)

To make sure your SQLite database (`civicpilot.db`) and receipts persist permanently across redeploys:

1. In Railway, right-click anywhere on the canvas (or click **"+ New"**).
2. Select **"Volume"**.
3. Connect the Volume to your service.
4. Set the Mount Path to:
   ```
   /app/backend/storage
   ```
   *(All submitted applications, verifiable receipts, and audit logs will be permanently saved to this disk)*

---

### Step 5: Generate Your Public Domain

1. In your service settings, navigate to the **"Settings"** tab.
2. Under the **"Networking"** section, click **"Generate Domain"**.
3. Railway will give you an instant SSL URL like:
   ```
   https://civicai-production.up.railway.app
   ```
4. Open that URL in your browser:
   - The React Gov-Tech Dashboard loads immediately at `/`.
   - The API is live at `/api/health` and `/api/services`.
   - Autonomous Playwright browser automation is fully functional.

---

## Pre-Configured Files Created in this Project

- [`Dockerfile`](file:///C:/Users/acer/Desktop/CivicAI/Dockerfile): Multi-stage container definition (Vite build + Playwright Chromium runner).
- [`railway.json`](file:///C:/Users/acer/Desktop/CivicAI/railway.json): Railway health check configuration and failure restart policies.
- [`.dockerignore`](file:///C:/Users/acer/Desktop/CivicAI/.dockerignore): Keeps Docker images slim by ignoring local cache and temporary files.
- [`backend/main.py`](file:///C:/Users/acer/Desktop/CivicAI/backend/main.py): Dynamically serves the React SPA at `/` while routing all API requests at `/api`.
- [`frontend/src/api.js`](file:///C:/Users/acer/Desktop/CivicAI/frontend/src/api.js): Uses relative paths in production to eliminate CORS issues entirely.
