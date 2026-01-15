@echo off
chcp 65001 >nul
title GitHub 연동 설정

echo ========================================
echo   GitHub 저장소 연동
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git이 설치되어 있지 않습니다!
    echo https://git-scm.com/download/win 에서 Git을 설치하세요.
    pause
    exit /b 1
)

echo ✅ Git이 설치되어 있습니다.
echo.

REM Check if already initialized
if exist ".git\" (
    echo ✅ Git 저장소가 이미 초기화되어 있습니다.
    echo.
    git remote -v
    echo.
) else (
    echo [1/3] Git 저장소 초기화 중...
    git init
    echo ✅ 초기화 완료!
    echo.
)

echo [2/3] 파일 추가 및 커밋...
git add .
git commit -m "Initial commit: 공급업체 분석 보고서 앱"
echo.

echo [3/3] GitHub 저장소 URL 입력
echo.
echo GitHub에서 새 저장소를 만든 후 URL을 입력하세요.
echo 예: https://github.com/username/repo-name.git
echo.
set /p REPO_URL="GitHub 저장소 URL: "

if "%REPO_URL%"=="" (
    echo.
    echo ❌ URL이 입력되지 않았습니다.
    pause
    exit /b 1
)

echo.
echo 원격 저장소 연결 중...
git remote add origin %REPO_URL% 2>nul
if errorlevel 1 (
    echo 원격 저장소가 이미 설정되어 있습니다. 업데이트 중...
    git remote set-url origin %REPO_URL%
)

echo.
echo 메인 브랜치로 변경 및 푸시...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo ✅ GitHub 연동 완료!
echo ========================================
echo.
echo 이제 다음 명령어로 변경사항을 푸시할 수 있습니다:
echo   git add .
echo   git commit -m "변경 내용"
echo   git push
echo.
pause
