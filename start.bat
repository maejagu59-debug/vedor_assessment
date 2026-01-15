@echo off
chcp 65001 >nul
title 공급업체 분석 보고서

echo ========================================
echo   공급업체 분석 보고서 자동 생성 앱
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/2] 의존성 설치 중...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ 의존성 설치 실패!
        echo Node.js가 설치되어 있는지 확인하세요.
        pause
        exit /b 1
    )
    echo.
    echo ✅ 의존성 설치 완료!
    echo.
) else (
    echo ✅ 의존성이 이미 설치되어 있습니다.
    echo.
)

echo [2/2] 개발 서버 시작 중...
echo.
echo 잠시 후 브라우저가 자동으로 열립니다...
echo 서버를 종료하려면 Ctrl+C를 누르세요.
echo.
echo ========================================
echo.

REM Start dev server in background and wait for it to be ready
start /B npm run dev

REM Wait for server to start (5 seconds)
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:5173

REM Keep the window open to show server logs
echo.
echo 브라우저가 열렸습니다. 이 창을 닫으면 서버가 종료됩니다.
echo.
pause
