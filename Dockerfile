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

ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HEADLESS=true \
    PYTHONPATH=/app/backend:$PYTHONPATH

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application code
COPY backend ./backend

# Copy built frontend assets from Stage 1 into backend/static_dist
COPY --from=frontend-builder /app/frontend/dist ./backend/static_dist

# Create screenshots and storage folders
RUN mkdir -p /app/backend/screenshots /app/backend/storage

# Set working directory to backend so all relative module imports resolve natively
WORKDIR /app/backend

EXPOSE 8000

# Start FastAPI server on dynamic Render/Railway PORT
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
