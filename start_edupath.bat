@echo off
echo ==============================================
echo         🚀 LAUNCHING EDUPATH... 🚀
echo ==============================================
echo.
echo Starting the Vite Development Server...
echo Please leave this window open while you work.
echo Press Ctrl+C to stop the server at any time.
echo.

:: Open the default web browser to the localhost address
start http://localhost:3000

:: Run the dev server
npm run dev
