@echo off
chcp 65001 >nul
title Fix Build Errors and Push

echo ========================================
echo   빌드 에러 수정 및 GitHub 푸시
echo ========================================
echo.

echo 변경사항 추가 중...
git add src/types/index.ts src/utils/CSVParser.ts src/components/ErrorBoundary.tsx src/components/admin/SupplierGroupEditor.tsx src/contexts/AppContext.tsx src/utils/AnalysisTextGenerator.ts

echo 커밋 중...
git commit -m "Fix: Render 빌드 에러 완전 수정 - 모든 타입 불일치 및 미사용 변수 제거"

echo GitHub에 푸시 중...
git push origin main

if errorlevel 1 (
    echo.
    echo ❌ 푸시 실패
    echo.
    echo 수동으로 다음 명령어를 실행하세요:
    echo   git push origin main
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 푸시 완료!
    echo ========================================
    echo.
    echo Render가 자동으로 재배포를 시작합니다.
    echo Render 대시보드에서 빌드 로그를 확인하세요.
    echo.
)

pause
