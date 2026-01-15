@echo off
chcp 65001 >nul
title 자동 Git 커밋 감시

echo ========================================
echo   파일 변경 자동 감지 및 커밋
echo ========================================
echo.
echo 이 창을 열어두면 파일 변경을 감지하여
echo 자동으로 Git에 커밋하고 푸시합니다.
echo.
echo 중지하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

REM Configure git user
git config user.name "maejagu59-debug" 2>nul
git config user.email "maejagu59-debug@users.noreply.github.com" 2>nul

:loop
REM Wait for 30 seconds
timeout /t 30 /nobreak >nul

REM Check if there are changes
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo [%date% %time%] Git 저장소가 초기화되지 않았습니다.
    echo upload-to-github-final.bat를 먼저 실행하세요.
    pause
    exit /b 1
)

REM Get status
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set CHANGES=%%i

if %CHANGES% GTR 0 (
    echo [%date% %time%] 변경사항 감지됨 (%CHANGES%개 파일)
    
    REM Get current timestamp
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
    
    REM Add all changes
    git add .
    
    REM Commit
    git commit -m "Auto-commit: %timestamp%"
    
    REM Push to remote
    git push 2>nul
    if errorlevel 1 (
        echo ⚠️  푸시 실패 (원격 저장소가 설정되지 않았을 수 있습니다)
    ) else (
        echo ✅ 커밋 및 푸시 완료!
    )
    echo.
) else (
    echo [%date% %time%] 변경사항 없음
)

goto loop
