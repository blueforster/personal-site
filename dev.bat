@echo off
chcp 65001 >nul
title NS Web - Local Dev Server

echo ========================================
echo   NS Web - Local Development Setup
echo ========================================
echo.

:: Load .env.local into environment (skip comments and empty lines)
if exist .env.local (
    for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
)

:: Step 1: Install dependencies
echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)
echo.

:: Step 2: Create .env.local if not exists
if not exist .env.local (
    echo [2/4] Creating .env.local from .env.example...
    copy .env.example .env.local >nul
    echo      Please edit .env.local with your values before continuing.
    echo      Opening .env.local in notepad...
    start /wait notepad .env.local
) else (
    echo [2/4] .env.local already exists, skipping.
)
echo.

:: Step 3: Generate Prisma client
echo [3/4] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed.
    pause
    exit /b 1
)
echo.

:: Step 4: Push DB schema (only if DATABASE_URL is set)
if "%DATABASE_URL%"=="" (
    echo [4/4] Skipping database push - DATABASE_URL is not set in .env.local
    echo       Fill in DATABASE_URL when your database is ready, then run:
    echo       npx prisma db push
) else (
    echo [4/4] Pushing database schema...
    call npx dotenv -e .env.local -- npx prisma db push
    if %errorlevel% neq 0 (
        echo WARNING: Database push failed. Check DATABASE_URL in .env.local
    )
)
echo.

:: Start dev server
echo ========================================
echo   Starting dev server...
echo   Open http://localhost:3000
echo   CMS:  http://localhost:3000/keystatic
echo   Press Ctrl+C to stop
echo ========================================
echo.
call npm run dev
