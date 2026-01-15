@echo off
chcp 65001 >nul
title GitHub 업로드 (수정됨)

echo ========================================
echo   GitHub 저장소 확인 및 업로드
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git\" (
    echo Git 초기화...
    git init
    git config user.name "masiggo9-dbug"
    git config user.email "masiggo9-dbug@users.noreply.github.com"
)

REM Add and commit
echo 파일 추가 및 커밋...
git add .
git commit -m "Initial commit: 공급업체 분석 보고서 앱" 2>nul

echo.
echo ========================================
echo GitHub 저장소 URL을 정확히 입력하세요
echo ========================================
echo.
echo GitHub 웹사이트에서 저장소 페이지를 열고
echo 초록색 "Code" 버튼을 클릭한 후
echo HTTPS URL을 복사하세요.
echo.
echo 예시:
echo   https://github.com/masiggo9-dbug/vedor_assessment.git
echo   또는
echo   https://github.com/masiggo9-dbug/vedoR_assessment.git
echo.
set /p REPO_URL="저장소 URL을 붙여넣으세요: "

if "%REPO_URL%"=="" (
    echo.
    echo ❌ URL이 입력되지 않았습니다.
    pause
    exit /b 1
)

echo.
echo 입력된 URL: %REPO_URL%
echo.

REM Remove old remote and add new one
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo ========================================
echo Personal Access Token 입력
echo ========================================
echo.
echo 새 토큰 생성: https://github.com/settings/tokens
echo   1. "Generate new token (classic)" 클릭
echo   2. Note: "vedor_assessment" 입력
echo   3. "repo" 권한 체크
echo   4. "Generate token" 클릭
echo   5. 생성된 토큰 복사 (ghp_로 시작)
echo.
set /p TOKEN="Personal Access Token을 붙여넣으세요: "

if "%TOKEN%"=="" (
    echo.
    echo ❌ 토큰이 입력되지 않았습니다.
    pause
    exit /b 1
)

echo.
echo 토큰 확인됨 (길이: %TOKEN:~0,10%...)
echo.

REM Extract username and repo from URL
for /f "tokens=4,5 delims=/" %%a in ("%REPO_URL%") do (
    set USERNAME=%%a
    set REPONAME=%%b
)

REM Remove .git extension if present
set REPONAME=%REPONAME:.git=%

echo 사용자: %USERNAME%
echo 저장소: %REPONAME%
echo.

REM Update remote with token
git remote set-url origin https://%TOKEN%@github.com/%USERNAME%/%REPONAME%.git

echo GitHub에 업로드 중...
git branch -M main
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ❌ 업로드 실패
    echo.
    echo 가능한 원인:
    echo   1. 저장소 URL이 잘못됨
    echo   2. 토큰이 잘못됨 또는 만료됨
    echo   3. 저장소가 존재하지 않음
    echo.
    echo GitHub에서 저장소를 먼저 생성했는지 확인하세요!
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 업로드 완료!
    echo ========================================
    echo.
    echo GitHub에서 확인: https://github.com/%USERNAME%/%REPONAME%
    echo.
    
    REM Clean up - remove token from remote URL
    git remote set-url origin %REPO_URL%
    echo ✅ 토큰 정리 완료 (보안)
)

echo.
pause
