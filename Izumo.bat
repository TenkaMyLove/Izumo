@echo off
title Starting Izumo Desktop Server...
cd /d "%~dp0"
echo.
echo  ========================================
echo    Izumo Desktop Server Loading...
echo  ========================================
echo.
node dist/server.cjs
