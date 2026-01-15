@echo off
chcp 65001 >nul
title GitHub에 코드 업로드

echo ========================================
echo   GitHub에 코드 업로드
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

echo ✅ Git 설치 확인 완료
echo.

REM Check if .git exists
if not exist ".git\" (
    echo [1/6] Git 저장소 초기화...
    git init
    echo ✅ 초기화 완료
    echo.
) else (
    echo ✅ Git 저장소가 이미 초기화되어 있습니다.
    echo.
)

REM Configure git user if needed
git config user.name >nul 2>&1
if errorlevel 1 (
    echo [2/6] Git 사용자 정보 설정
    echo.
    set /p GIT_NAME="Git 사용자 이름 (GitHub 이름): "
    set /p GIT_EMAIL="Git 이메일 (GitHub 이메일): "
    git config user.name "%GIT_NAME%"
    git config user.email "%GIT_EMAIL%"
    echo ✅ 사용자 정보 설정 완료
    echo.
) else (
    echo [2/6] Git 사용자 정보 확인
    echo 이름: 
    git config user.name
    echo 이메일: 
    git config user.email
    echo ✅ 사용자 정보 확인 완료
    echo.
)

REM Add all files
echo [3/6] 모든 파일 추가 중...
git add .
echo ✅ 파일 추가 완료
echo.

REM Commit
echo [4/6] 커밋 생성 중...
git commit -m "Initial commit: 공급업체 분석 보고서 앱"
if errorlevel 1 (
    echo ℹ️  커밋할 변경사항이 없거나 이미 커밋되었습니다.
    echo.
) else (
    echo ✅ 커밋 완료
    echo.
)

REM Setup remote
echo [5/6] GitHub 원격 저장소 연결
echo.
echo 스크린샷에서 보이는 GitHub 저장소 URL을 입력하세요.
echo 예: https://github.com/masiggo9-dbug/vedor_assessment.git
echo.
set /p REPO_URL="GitHub 저장소 URL: "

if "%REPO_URL%"=="" (
    echo ❌ URL이 입력되지 않았습니다.
    pause
    exit /b 1
)

echo.
echo 원격 저장소 연결 중...
git remote add origin %REPO_URL% 2>nul
if errorlevel 1 (
    echo ℹ️  원격 저장소가 이미 설정되어 있습니다. URL 업데이트 중...
    git remote set-url origin %REPO_URL%
)
echo ✅ 원격 저장소 연결 완료
echo.

REM Push to GitHub
echo [6/6] GitHub에 업로드 중...
echo.
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 업로드 실패!
    echo.
    echo 가능한 원인:
    echo 1. GitHub 인증 필요 - 사용자 이름과 Personal Access Token 입력
    echo 2. 원격 저장소 URL 오류
    echo 3. 네트워크 연결 문제
    echo.
    echo GitHub Personal Access Token 생성:
    echo https://github.com/settings/tokens
    echo - repo 권한 선택
    echo - 생성된 토큰을 비밀번호로 사용
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo ✅ GitHub 업로드 완료!
    echo ========================================
    echo.
    echo GitHub 저장소를 확인하세요:
    echo %REPO_URL%
    echo.
)

pause
