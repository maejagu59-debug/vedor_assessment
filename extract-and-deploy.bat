@echo off
chcp 65001 >nul
title 데이터 추출 및 배포

echo ========================================
echo   로컬 데이터 추출 및 배포
echo ========================================
echo.

echo 1단계: 로컬 서버 실행
echo.
echo 새 터미널 창이 열립니다.
echo 그 창에서 "npm run dev" 명령어를 실행하세요.
echo.
start cmd /k "echo 다음 명령어를 입력하세요: npm run dev"

echo.
echo 2단계: 브라우저에서 데이터 추출
echo.
echo 서버가 시작되면 (약 10초 후):
echo.
echo 1. 브라우저에서 http://localhost:5173 접속
echo 2. F12 키를 눌러 개발자 도구 열기
echo 3. Console 탭 선택
echo 4. extract-data-script.js 파일 열기
echo 5. 전체 내용을 복사해서 콘솔에 붙여넣기
echo 6. Enter 키 누르기
echo 7. initial-data.json 파일이 다운로드됩니다
echo.
echo 8. 다운로드한 파일을 이 프로젝트의 public 폴더에 복사
echo.
pause

echo.
echo 3단계: initial-data.json 파일이 public 폴더에 있는지 확인
echo.

if not exist "public\initial-data.json" (
    echo ❌ public\initial-data.json 파일이 없습니다!
    echo.
    echo 위의 2단계를 먼저 완료하세요.
    echo.
    pause
    exit /b 1
)

echo ✅ initial-data.json 파일 확인됨
echo.

echo 4단계: Git에 커밋 및 배포
echo.

git add public\initial-data.json
git add src\utils\DataExporter.ts
git add src\contexts\AppContext.tsx
git add src\pages\AdminPage.tsx
git add extract-data-script.js
git add QUICK_DEPLOY_GUIDE.md
git add DATA_EXPORT_GUIDE.md

git commit -m "Add: 초기 데이터 및 데이터 관리 기능 추가"

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
    echo 약 5분 후 배포된 사이트에서 데이터를 확인하세요.
    echo.
)

pause
