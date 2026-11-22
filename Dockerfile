# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Playwright + Python Backend Runner
# ==========================================
FROM mcr.microsoft.com/playwright/python:v1.49.0-noble AS runner
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HEADLESS=true

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application code
COPY backend ./backend

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./backend/static_dist

# Create screenshots and storage folders
RUN mkdir -p /app/backend/screenshots /app/backend/storage

EXPOSE 8000

# Start FastAPI server using dynamic Railway PORT
CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
