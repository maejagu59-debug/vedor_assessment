@echo off
chcp 65001 >nul
title 초기 데이터 업데이트 및 배포

echo ========================================
echo   초기 데이터 업데이트 및 배포
echo ========================================
echo.

if not exist "public\initial-data.json" (
    echo ❌ public\initial-data.json 파일이 없습니다!
    echo.
    echo 다음 단계를 먼저 수행하세요:
    echo 1. 로컬 환경에서 앱 실행: npm run dev
    echo 2. 관리자 페이지에서 "📥 데이터 내보내기" 클릭
    echo 3. 다운로드한 파일을 initial-data.json으로 이름 변경
    echo 4. public 폴더에 복사
    echo.
    pause
    exit /b 1
)

echo ✅ initial-data.json 파일 확인됨
echo.

echo Git에 추가 및 커밋 중...
git add public\initial-data.json
git commit -m "Update: 초기 데이터 업데이트 (거래 데이터 및 그룹 설정)"

echo.
echo GitHub에 푸시 중...
git push origin main

if errorlevel 1 (
    echo.
    echo ❌ 푸시 실패
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 배포 완료!
    echo ========================================
    echo.
    echo Render가 자동으로 재배포를 시작합니다.
    echo 배포 완료 후 사이트에서 데이터를 확인하세요.
    echo.
)

pause
