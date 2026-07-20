@echo off
echo Starting the Backend Server...
start cmd /k "cd backend && node server.js"

echo Starting the React Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting in separate windows.
