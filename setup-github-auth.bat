@echo off
chcp 65001 >nul
title GitHub 인증 설정

echo ========================================
echo   GitHub 인증 정보 설정
echo ========================================
echo.

echo Git Credential Helper를 설정합니다.
echo 한 번만 입력하면 자동으로 저장됩니다.
echo.

REM Set credential helper to store
git config --global credential.helper store

echo ✅ Credential Helper 설정 완료
echo.
echo 이제 GitHub에 푸시할 때:
echo   Username: masiggo9-dbug
echo   Password: [새로운 Personal Access Token]
echo.
echo 한 번 입력하면 자동으로 저장됩니다.
echo.

pause
