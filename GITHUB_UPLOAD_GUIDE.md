# GitHub 업로드 가이드

## 문제 해결: Repository not found

"Repository not found" 오류는 다음 이유로 발생합니다:
1. GitHub에 저장소가 아직 생성되지 않음
2. 저장소 URL이 잘못됨
3. 저장소가 Private이고 권한이 없음

## 방법 1: 배치 파일 사용 (권장)

### 1단계: GitHub에서 저장소 생성

1. https://github.com/new 접속
2. Repository name 입력 (예: `vedor_assessment`)
3. Public 선택
4. **"Add a README file" 체크 해제** (이미 있음)
5. "Create repository" 클릭

### 2단계: 저장소 URL 복사

생성된 저장소 페이지에서:
1. 초록색 "Code" 버튼 클릭
2. HTTPS 탭 선택
3. URL 복사 (예: `https://github.com/masiggo9-dbug/vedor_assessment.git`)

### 3단계: Personal Access Token 생성

1. https://github.com/settings/tokens 접속
2. "Generate new token (classic)" 클릭
3. Note: "vedor_assessment" 입력
4. Expiration: "No expiration" 또는 원하는 기간
5. "repo" 권한 체크 (전체)
6. 페이지 하단 "Generate token" 클릭
7. **생성된 토큰 복사** (ghp_로 시작, 한 번만 표시됨!)

### 4단계: 업로드 실행

1. **`github-push-fixed.bat`** 더블클릭
2. 저장소 URL 붙여넣기 (Ctrl+V)
3. Enter
4. Personal Access Token 붙여넣기 (Ctrl+V)
5. Enter
6. 완료!

## 방법 2: GitHub Desktop 사용 (가장 쉬움)

### 1단계: GitHub Desktop 설치

https://desktop.github.com/ 에서 다운로드 및 설치

### 2단계: GitHub 로그인

GitHub Desktop에서 GitHub 계정으로 로그인

### 3단계: 저장소 추가

1. File > Add local repository
2. 프로젝트 폴더 선택
3. "Publish repository" 클릭
4. 저장소 이름 확인
5. "Publish repository" 클릭
6. 완료!

### 이후 변경사항 업로드

1. GitHub Desktop 열기
2. 변경된 파일 확인
3. 커밋 메시지 입력
4. "Commit to main" 클릭
5. "Push origin" 클릭

## 방법 3: 수동 명령어 (고급)

```bash
# 1. Git 초기화
git init
git config user.name "masiggo9-dbug"
git config user.email "masiggo9-dbug@users.noreply.github.com"

# 2. 파일 추가 및 커밋
git add .
git commit -m "Initial commit: 공급업체 분석 보고서 앱"

# 3. 원격 저장소 연결 (URL을 실제 저장소 URL로 변경)
git remote add origin https://github.com/masiggo9-dbug/vedor_assessment.git

# 4. 업로드
git branch -M main
git push -u origin main
```

인증 정보 입력:
- Username: `masiggo9-dbug`
- Password: `[Personal Access Token]`

## 문제 해결

### "Repository not found" 오류

**해결책:**
1. GitHub 웹사이트에서 저장소가 실제로 생성되었는지 확인
2. 저장소 URL이 정확한지 확인 (대소문자 구분!)
3. Private 저장소인 경우 권한 확인

### "Permission denied" 오류

**해결책:**
1. Personal Access Token이 올바른지 확인
2. 토큰에 "repo" 권한이 있는지 확인
3. 토큰이 만료되지 않았는지 확인

### 인증 정보를 입력할 수 없음

**해결책:**
1. `github-push-fixed.bat` 사용 (토큰을 미리 입력)
2. GitHub Desktop 사용 (GUI로 쉽게 인증)
3. Git Credential Manager 설치

## 추천 방법

**초보자:** GitHub Desktop 사용 (가장 쉬움)
**중급자:** `github-push-fixed.bat` 사용
**고급자:** 수동 명령어 사용

## 보안 주의사항

- Personal Access Token은 비밀번호처럼 안전하게 보관
- 토큰을 코드나 파일에 저장하지 말 것
- 토큰이 노출되면 즉시 삭제하고 새로 생성
- 필요한 최소 권한만 부여 (repo만)
- 만료 기간 설정 권장
