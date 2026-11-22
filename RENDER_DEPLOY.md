# CIVICPILOT AI – 100% FREE DEPLOYMENT ON RENDER

Render has a **100% Free Tier** that does not require a paid trial or credit card to deploy!

Because we created the root `Dockerfile` and `render.yaml`, Render will build both Frontend and Backend together as a single unified service for **$0/month**.

---

## 3-Step Free Deployment on Render

### Step 1: Push Your Code to GitHub

```bash
cd C:\Users\acer\Desktop\CivicAI
git add .
git commit -m "feat: configure 100% free deployment for Render"
git push -u origin main
```

---

### Step 2: Create Free Web Service on Render

1. Go to **[render.com](https://render.com)** and sign up / log in with your GitHub account.
2. On your dashboard, click **"New +"** $\rightarrow$ **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** $\rightarrow$ Click **"Next"**.
4. Connect and select your **`CivicAI`** repository.
5. In the configuration settings:
   - **Name:** `civicpilot-ai`
   - **Language:** **Docker** *(Render will automatically select this)*
   - **Instance Type:** Select **"Free" ($0/month)**.

---

### Step 3: Add Your Environment Variables & Deploy

1. Scroll down to the **"Environment Variables"** section.
2. Click **"Add Environment Variable"**:
   - Key: `GEMINI_API_KEY` $\rightarrow$ Value: *(Your Google Gemini API Key)*
   - Key: `HEADLESS` $\rightarrow$ Value: `true`
3. Click **"Deploy Web Service"**.

---

### That's It!

Render will build the React frontend, set up Playwright Chromium, and give you an instant live URL like:
```
https://civicpilot-ai.onrender.com
```

- React Gov-Tech Dashboard opens at `/`.
- Backend API responds at `/api/health` and `/api/services`.
- Playwright autonomous agent runs headlessly in the cloud.
