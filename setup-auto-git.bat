@echo off
chcp 65001 >nul
title Git 자동 커밋 시스템 설정

echo ========================================
echo   Git 자동 커밋 시스템 설정
echo ========================================
echo.

REM Step 1: Setup Git
echo [1/3] Git 저장소 설정 중...
call setup-git.bat
echo.

REM Step 2: Create initial commit
echo [2/3] 현재 상태 커밋 중...
call auto-commit.bat
echo.

REM Step 3: Instructions
echo [3/3] 자동 커밋 시스템 활성화
echo.
echo ========================================
echo ✅ 설정 완료!
echo ========================================
echo.
echo 이제 다음 방법으로 자동 커밋을 사용할 수 있습니다:
echo.
echo 방법 1: 수동 커밋
echo   - 파일 수정 후 auto-commit.bat 실행
echo.
echo 방법 2: 자동 감시 (권장)
echo   - watch-and-commit.bat 실행
echo   - 30초마다 변경사항을 자동으로 커밋하고 푸시
echo   - 백그라운드에서 계속 실행
echo.
echo 방법 3: Kiro Hook (IDE 통합)
echo   - Kiro에서 파일 저장 시 자동 커밋
echo   - Command Palette에서 'Open Kiro Hook UI' 검색
echo   - 'Auto Git Commit' 훅 활성화
echo.
echo ========================================
echo.
echo 자동 감시를 지금 시작하시겠습니까? (Y/N)
set /p START_WATCH="선택: "

if /i "%START_WATCH%"=="Y" (
    echo.
    echo 자동 감시 시작 중...
    start "Git Auto Commit" watch-and-commit.bat
    echo ✅ 백그라운드에서 실행 중입니다!
)

echo.
pause
