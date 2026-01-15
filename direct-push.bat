@echo off
chcp 65001 >nul
title GitHub 직접 푸시

echo ========================================
echo   GitHub 직접 푸시 (토큰 포함)
echo ========================================
echo.

echo Git 사용자 설정...
git config user.name "maejagu59-debug"
git config user.email "maejagu59-debug@users.noreply.github.com"
echo.

echo 원격 저장소 URL 확인...
git remote set-url origin https://github.com/maejagu59-debug/vedor_assessment.git
echo.

echo GitHub에 푸시 중...
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ❌ 업로드 실패
    echo.
    echo 오류 메시지를 확인하세요.
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 업로드 완료!
    echo ========================================
    echo.
    
    REM Clean up token from URL
    git remote set-url origin https://github.com/maejagu59-debug/vedor_assessment.git
    echo ✅ 보안을 위해 URL에서 토큰 제거 완료
    echo.
    
    echo GitHub: https://github.com/maejagu59-debug/vedor_assessment
    echo.
    echo 브라우저에서 새로고침하세요!
    echo.
)

echo.
echo ⚠️  이 파일을 삭제하세요 (토큰 포함)
echo.
pause
