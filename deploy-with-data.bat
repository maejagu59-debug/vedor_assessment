@echo off
chcp 65001 >nul
title 데이터 내보내기 기능 배포

echo ========================================
echo   데이터 내보내기 기능 배포
echo ========================================
echo.

echo 변경사항 추가 중...
git add src/utils/DataExporter.ts
git add src/contexts/AppContext.tsx
git add src/pages/AdminPage.tsx
git add DATA_EXPORT_GUIDE.md

echo 커밋 중...
git commit -m "Add: 데이터 내보내기/가져오기 기능 추가 - localStorage 데이터를 JSON으로 관리"

echo GitHub에 푸시 중...
git push origin main

if errorlevel 1 (
    echo.
    echo ❌ 푸시 실패
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 푸시 완료!
    echo ========================================
    echo.
    echo 다음 단계:
    echo.
    echo 1. 로컬 환경에서 앱 실행: npm run dev
    echo 2. 관리자 페이지 접속 (비밀번호: 0070)
    echo 3. "📥 데이터 내보내기" 버튼 클릭
    echo 4. 다운로드한 파일을 initial-data.json으로 이름 변경
    echo 5. public 폴더에 복사
    echo 6. update-initial-data.bat 실행
    echo.
    echo 자세한 내용은 DATA_EXPORT_GUIDE.md 참조
    echo.
)

pause
