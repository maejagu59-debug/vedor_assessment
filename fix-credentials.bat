@echo off
chcp 65001 >nul
title Git 자격 증명 수정

echo ========================================
echo   Git 자격 증명 초기화 및 수정
echo ========================================
echo.

echo [1/5] 기존 자격 증명 삭제...
git config --global --unset credential.helper 2>nul
git config --unset credential.helper 2>nul

REM Clear Windows Credential Manager
cmdkey /list | findstr "github.com" >nul
if not errorlevel 1 (
    echo Windows 자격 증명 관리자에서 GitHub 자격 증명 삭제 중...
    for /f "tokens=1,2 delims= " %%a in ('cmdkey /list ^| findstr "github.com"') do (
        cmdkey /delete:%%b 2>nul
    )
)
echo ✅ 완료
echo.

echo [2/5] Git 사용자 정보 설정...
git config user.name "maejagu59-debug"
git config user.email "maejagu59-debug@users.noreply.github.com"
echo ✅ 완료
echo.

echo [3/5] 새로운 자격 증명 헬퍼 설정...
git config credential.helper manager-core
echo ✅ 완료
echo.

echo [4/5] 원격 저장소 URL 확인...
git remote -v
echo.

echo [5/5] GitHub에 다시 푸시...
echo.
echo 인증 창이 나타나면:
echo   Username: maejagu59-debug
echo   Password: [새로운 Personal Access Token 입력]
echo.
echo 또는 터미널에서 직접 입력하세요.
echo.

git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ❌ 여전히 실패하는 경우, 수동으로 인증하세요:
    echo.
    echo 1. GitHub Desktop 사용 (가장 쉬움)
    echo 2. 또는 새로운 Personal Access Token 생성 후 사용
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 업로드 완료!
    echo ========================================
    echo.
    echo GitHub: https://github.com/maejagu59-debug/vedor_assessment
    echo.
)

pause