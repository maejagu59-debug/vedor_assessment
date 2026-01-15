@echo off
chcp 65001 >nul
title GitHub 안전 업로드

echo ========================================
echo   GitHub 안전 업로드
echo ========================================
echo.

REM Configure user
git config user.name "maejagu59-debug"
git config user.email "maejagu59-debug@users.noreply.github.com"

REM Add all files (respecting .gitignore)
echo 파일 추가 중...
git add .
echo.

REM Commit
echo 커밋 생성 중...
git commit -m "Initial commit: 공급업체 분석 보고서 앱"
echo.

REM Setup remote
git remote remove origin 2>nul
git remote add origin https://github.com/maejagu59-debug/vedor_assessment.git

REM Configure credential helper
git config credential.helper store

echo ========================================
echo GitHub에 업로드 중...
echo ========================================
echo.
echo 인증 정보를 입력하세요:
echo   Username: maejagu59-debug
echo   Password: [Personal Access Token]
echo.

git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 업로드 실패
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 업로드 완료!
    echo ========================================
    echo.
    echo https://github.com/maejagu59-debug/vedor_assessment
    echo.
)

pause
