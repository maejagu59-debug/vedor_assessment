@echo off
chcp 65001 >nul
title Copy CSV files to public folder

echo ========================================
echo   CSV 파일을 public 폴더로 복사
echo ========================================
echo.

echo CSV 파일 복사 중...
copy /Y suppliers-export-2025-11-17_08-41-15.csv public\
copy /Y supplier_info-export-2025-12-16_11-10-36.csv public\
copy /Y evaluations-export-2025-12-16_09-48-09.csv public\

echo.
echo ========================================
echo ✅ 복사 완료!
echo ========================================
echo.

echo Git에 추가 및 커밋 중...
git add .gitignore
git add public\suppliers-export-2025-11-17_08-41-15.csv
git add public\supplier_info-export-2025-12-16_11-10-36.csv
git add public\evaluations-export-2025-12-16_09-48-09.csv
git commit -m "Fix: CSV 파일들을 public 폴더에 추가 및 .gitignore 수정"

echo.
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
    echo 이제 배포된 사이트에서 공급업체 데이터가 표시됩니다!
    echo.
)

pause
