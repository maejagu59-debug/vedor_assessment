# Git 자동 커밋 시스템 가이드

## 🚀 빠른 시작

1. **`setup-auto-git.bat`** 더블클릭
   - Git 저장소 초기화
   - GitHub 연결
   - 자동 커밋 시스템 활성화

## 📋 사용 방법

### 방법 1: 자동 감시 모드 (권장)

**`watch-and-commit.bat`** 실행
- 30초마다 변경사항 자동 감지
- 자동으로 커밋 및 푸시
- 백그라운드에서 계속 실행
- 중지: Ctrl+C

```bash
# 실행 예시
더블클릭: watch-and-commit.bat
```

### 방법 2: 수동 커밋

**`auto-commit.bat`** 실행
- 파일 수정 후 수동으로 실행
- 모든 변경사항을 한 번에 커밋
- 자동으로 푸시

```bash
# 실행 예시
더블클릭: auto-commit.bat
```

### 방법 3: Kiro Hook (IDE 통합)

Kiro에서 파일 저장 시 자동 커밋:

1. Command Palette 열기 (Ctrl+Shift+P)
2. "Open Kiro Hook UI" 검색
3. "Auto Git Commit" 훅 활성화
4. 파일 저장할 때마다 자동 커밋

또는:

1. Explorer 뷰에서 "Agent Hooks" 섹션 열기
2. "Auto Git Commit" 활성화

## 📁 생성된 파일들

- `setup-auto-git.bat` - 전체 시스템 설정
- `setup-git.bat` - Git 저장소 초기 설정
- `auto-commit.bat` - 수동 커밋 스크립트
- `watch-and-commit.bat` - 자동 감시 및 커밋
- `.kiro/hooks/auto-git-commit.json` - Kiro Hook 설정

## ⚙️ 커밋 메시지 형식

자동 커밋 메시지:
```
Auto-commit: 2026-01-15 14:30:45
```

원하는 경우 `auto-commit.bat`를 수정하여 커밋 메시지를 변경할 수 있습니다.

## 🔧 고급 설정

### 커밋 주기 변경

`watch-and-commit.bat`에서 다음 줄을 수정:
```batch
timeout /t 30 /nobreak >nul
```
30을 원하는 초로 변경 (예: 60 = 1분)

### 특정 파일 제외

`.gitignore`에 추가:
```
# 제외할 파일
*.log
temp/
```

### 커밋 메시지 커스터마이징

`auto-commit.bat`의 커밋 부분 수정:
```batch
git commit -m "Auto-commit: %timestamp%"
```
를 원하는 메시지로 변경

## 🛡️ 보안 주의사항

- CSV 파일은 자동으로 제외됩니다 (`.gitignore`)
- 민감한 데이터가 포함된 파일은 `.gitignore`에 추가하세요
- Private 저장소 사용을 권장합니다

## 🐛 문제 해결

### Git이 설치되지 않음
https://git-scm.com/download/win 에서 설치

### 푸시 실패
```bash
git remote -v  # 원격 저장소 확인
git remote add origin [YOUR_REPO_URL]  # 원격 저장소 추가
```

### 인증 오류
```bash
git config credential.helper store  # 자격 증명 저장
git push  # 한 번 수동으로 푸시 (인증 정보 입력)
```

### 변경사항이 커밋되지 않음
- `.gitignore`에 해당 파일이 있는지 확인
- `git status`로 상태 확인

## 📊 작업 흐름

```
파일 수정
    ↓
watch-and-commit.bat 감지 (30초마다)
    ↓
git add .
    ↓
git commit -m "Auto-commit: [timestamp]"
    ↓
git push
    ↓
GitHub에 자동 업로드 ✅
```

## 💡 팁

1. **개발 중**: `watch-and-commit.bat` 백그라운드 실행
2. **큰 변경 후**: `auto-commit.bat` 수동 실행
3. **IDE 사용**: Kiro Hook 활성화
4. **여러 PC**: 작업 시작 전 `git pull` 실행

## 🔗 관련 파일

- `GITHUB_SETUP.md` - GitHub 연동 가이드
- `.gitignore` - 제외 파일 목록
- `README.md` - 프로젝트 설명
