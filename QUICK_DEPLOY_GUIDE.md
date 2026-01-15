# 빠른 배포 가이드

## 현재 상황
로컬 환경(http://localhost:5173)에 입력한 거래 데이터와 그룹 설정을 배포 환경에도 적용하기

## 단계별 실행

### 1단계: 로컬 서버 실행
```bash
npm run dev
```

### 2단계: 브라우저에서 데이터 추출

1. 브라우저에서 http://localhost:5173 접속
2. F12 키를 눌러 개발자 도구 열기
3. "Console" 탭 선택
4. `extract-data-script.js` 파일의 내용을 복사해서 콘솔에 붙여넣기
5. Enter 키 누르기
6. `initial-data.json` 파일이 자동으로 다운로드됩니다

### 3단계: 파일 복사

다운로드한 `initial-data.json` 파일을 프로젝트의 `public` 폴더에 복사

```bash
# Windows
copy Downloads\initial-data.json public\
```

### 4단계: Git에 커밋 및 배포

```bash
git add public/initial-data.json
git add src/utils/DataExporter.ts
git add src/contexts/AppContext.tsx
git add src/pages/AdminPage.tsx
git commit -m "Add: 초기 데이터 및 데이터 관리 기능 추가"
git push origin main
```

또는 배치 파일 실행:
```bash
deploy-all-data.bat
```

## 완료!

배포가 완료되면 (약 5분 후):
- ✅ 모든 사용자가 당신이 입력한 거래 데이터를 볼 수 있습니다
- ✅ 공급업체 그룹 분류가 적용됩니다
- ✅ 다른 사람들은 읽기 전용으로만 사용 가능
- ✅ 당신만 관리자 페이지에서 수정 가능

## 데이터 업데이트 방법

나중에 데이터를 수정하고 다시 배포하려면:

1. 로컬에서 데이터 수정
2. 위의 2-4단계 반복
