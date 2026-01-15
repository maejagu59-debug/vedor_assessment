@echo off
chcp 65001 >nul
title Git 완전 초기화 및 업로드

echo ========================================
echo   Git 히스토리 완전 초기화
echo ========================================
echo.
echo 경고: 기존 Git 히스토리가 모두 삭제됩니다.
echo 계속하시겠습니까? (Y/N)
set /p CONFIRM="선택: "

if /i not "%CONFIRM%"=="Y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1/6] 기존 .git 폴더 삭제...
rmdir /s /q .git 2>nul
echo ✅ 완료
echo.

echo [2/6] Git 새로 초기화...
git init
git config user.name "maejagu59-debug"
git config user.email "maejagu59-debug@users.noreply.github.com"
echo ✅ 완료
echo.

echo [3/6] 모든 파일 추가 (.gitignore 적용)...
git add .
echo ✅ 완료
echo.

echo [4/6] 깨끗한 커밋 생성...
git commit -m "Initial commit: 공급업체 분석 보고서 앱"
echo ✅ 완료
echo.

echo [5/6] 원격 저장소 연결...
git remote add origin https://github.com/maejagu59-debug/vedor_assessment.git
git branch -M main
echo ✅ 완료
echo.

echo [6/6] GitHub에 업로드...
echo.
echo 인증 정보를 입력하세요:
echo   Username: maejagu59-debug
echo   Password: [Personal Access Token 붙여넣기]
echo.

git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ❌ 업로드 실패
    echo.
    echo 인증 정보를 다시 확인하세요.
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ 업로드 완료!
    echo ========================================
    echo.
    echo GitHub: https://github.com/maejagu59-debug/vedor_assessment
    echo.
    echo 브라우저에서 페이지를 새로고침하세요!
    echo.
)

pause
