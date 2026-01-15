@echo off
chcp 65001 >nul
title 빠른 GitHub 업로드

echo ========================================
echo   빠른 GitHub 업로드
echo ========================================
echo.

REM Your GitHub repository URL from the screenshot
set REPO_URL=https://github.com/masiggo9-dbug/vedor_assessment.git

echo GitHub 저장소: %REPO_URL%
echo.

REM Initialize if needed
if not exist ".git\" (
    echo Git 초기화 중...
    git init
)

REM Add all files
echo 파일 추가 중...
git add .

REM Commit
echo 커밋 생성 중...
git commit -m "Initial commit: 공급업체 분석 보고서 앱"

REM Add remote
echo 원격 저장소 연결 중...
git remote add origin %REPO_URL% 2>nul
if errorlevel 1 (
    git remote set-url origin %REPO_URL%
)

REM Create main branch and push
echo GitHub에 업로드 중...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 업로드 실패!
    echo.
    echo GitHub 인증이 필요합니다.
    echo.
    echo Personal Access Token 생성 방법:
    echo 1. https://github.com/settings/tokens 접속
    echo 2. "Generate new token" ^(classic^) 클릭
    echo 3. "repo" 권한 선택
    echo 4. 토큰 생성 후 복사
    echo 5. 다시 실행하고 비밀번호로 토큰 입력
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 업로드 완료!
    echo ========================================
    echo.
    echo GitHub에서 확인하세요:
    echo https://github.com/masiggo9-dbug/vedor_assessment
    echo.
)

pause
