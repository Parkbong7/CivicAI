@echo off
title CivicPilot AI - Backend Service
echo Checking for existing processes on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Terminating stale process %%a on port 8000...
    taskkill /f /pid %%a >nul 2>&1
)
echo Starting CivicPilot AI FastAPI Backend on http://127.0.0.1:8000 ...
cd /d "%~dp0backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --loop main:proactor_loop_factory --reload
pause
