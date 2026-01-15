@echo off
chcp 65001 >nul
title Git 저장소 설정 및 초기 커밋

echo ========================================
echo   Git 저장소 초기 설정
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git이 설치되어 있지 않습니다!
    echo https://git-scm.com/download/win 에서 Git을 설치하세요.
    pause
    exit /b 1
)

echo ✅ Git 설치 확인 완료
echo.

REM Initialize git if not already done
if not exist ".git\" (
    echo [1/5] Git 저장소 초기화...
    git init
    echo ✅ 초기화 완료
    echo.
) else (
    echo ✅ Git 저장소가 이미 초기화되어 있습니다.
    echo.
)

REM Configure git user if not set
git config user.name >nul 2>&1
if errorlevel 1 (
    echo [2/5] Git 사용자 정보 설정
    set /p USERNAME="Git 사용자 이름: "
    set /p EMAIL="Git 이메일: "
    git config user.name "%USERNAME%"
    git config user.email "%EMAIL%"
    echo ✅ 사용자 정보 설정 완료
    echo.
) else (
    echo ✅ Git 사용자 정보가 이미 설정되어 있습니다.
    echo.
)

REM Add all files
echo [3/5] 파일 추가 중...
git add .
echo ✅ 파일 추가 완료
echo.

REM Initial commit
echo [4/5] 초기 커밋 생성...
git commit -m "Initial commit: 공급업체 분석 보고서 앱" 2>nul
if errorlevel 1 (
    echo ℹ️  커밋할 변경사항이 없거나 이미 커밋되었습니다.
) else (
    echo ✅ 초기 커밋 완료
)
echo.

REM Setup remote
echo [5/5] GitHub 원격 저장소 연결
echo.
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo GitHub에서 새 저장소를 만드셨나요? (Y/N)
    set /p SETUP_REMOTE="원격 저장소를 지금 설정하시겠습니까? "
    
    if /i "%SETUP_REMOTE%"=="Y" (
        echo.
        echo GitHub 저장소 URL을 입력하세요.
        echo 예: https://github.com/username/repo-name.git
        echo.
        set /p REPO_URL="GitHub 저장소 URL: "
        
        if not "%REPO_URL%"=="" (
            git remote add origin %REPO_URL%
            git branch -M main
            git push -u origin main
            echo ✅ 원격 저장소 연결 및 푸시 완료!
        )
    ) else (
        echo.
        echo ℹ️  나중에 다음 명령어로 원격 저장소를 연결할 수 있습니다:
        echo    git remote add origin [YOUR_REPO_URL]
        echo    git branch -M main
        echo    git push -u origin main
    )
) else (
    echo ✅ 원격 저장소가 이미 연결되어 있습니다:
    git remote get-url origin
)

echo.
echo ========================================
echo ✅ Git 설정 완료!
echo ========================================
echo.
echo 이제 파일을 수정하고 저장한 후:
echo   1. auto-commit.bat 실행 - 자동 커밋 및 푸시
echo   2. watch-and-commit.bat 실행 - 파일 변경 감지 및 자동 커밋
echo.
pause
