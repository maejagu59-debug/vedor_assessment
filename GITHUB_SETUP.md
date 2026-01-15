# GitHub 연동 가이드

## 1단계: Git 초기화 (아직 안 했다면)

터미널에서 다음 명령어를 실행하세요:

```bash
git init
git add .
git commit -m "Initial commit: 공급업체 분석 보고서 앱"
```

## 2단계: GitHub에 새 저장소 만들기

1. https://github.com/new 에 접속
2. Repository name 입력 (예: `supplier-analysis-app`)
3. Public 또는 Private 선택
4. **"Add a README file" 체크 해제** (이미 있음)
5. "Create repository" 클릭

## 3단계: 로컬 저장소와 GitHub 연결

GitHub에서 생성된 저장소 페이지에 나오는 명령어를 실행하세요:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**YOUR_USERNAME**과 **YOUR_REPO_NAME**을 실제 값으로 바꾸세요!

## 4단계: 이후 변경사항 푸시

코드를 수정한 후:

```bash
git add .
git commit -m "변경 내용 설명"
git push
```

## 주의사항

- CSV 파일들은 `.gitignore`에 추가되어 GitHub에 업로드되지 않습니다
- 민감한 공급업체 데이터가 공개되지 않도록 주의하세요
- `sample-data.csv`만 예시로 포함됩니다

## GitHub Pages로 배포하기 (선택사항)

앱을 온라인으로 배포하려면:

1. `package.json`에 homepage 추가:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
   ```

2. 배포 스크립트 추가:
   ```bash
   npm install --save-dev gh-pages
   ```

3. `package.json`의 scripts에 추가:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

4. 배포 실행:
   ```bash
   npm run deploy
   ```

5. GitHub 저장소 Settings > Pages에서 Source를 "gh-pages" 브랜치로 설정
