# 데이터 내보내기 및 배포 가이드

## 개요
거래 데이터와 공급업체 그룹 분류는 브라우저의 localStorage에 저장됩니다.
배포 환경에서도 이 데이터를 사용하려면 다음 절차를 따르세요.

## 1단계: 로컬 환경에서 데이터 내보내기

### 방법 1: 관리자 페이지에서 내보내기 (권장)

1. 로컬 환경에서 앱 실행 (`npm run dev`)
2. 관리자 페이지 접속 (비밀번호: 0070)
3. 상단의 **"📥 데이터 내보내기"** 버튼 클릭
4. `supplier-data-export-YYYY-MM-DD.json` 파일이 다운로드됩니다

### 방법 2: 브라우저 콘솔에서 내보내기

1. 로컬 환경에서 앱 실행
2. 브라우저 개발자 도구 열기 (F12)
3. 콘솔 탭에서 다음 명령어 실행:

```javascript
DataExporter.downloadAsJSON()
```

## 2단계: 초기 데이터 파일 생성

1. 다운로드한 JSON 파일의 이름을 `initial-data.json`으로 변경
2. 파일을 `public` 폴더에 복사

```bash
copy supplier-data-export-2025-01-15.json public\initial-data.json
```

## 3단계: Git에 커밋 및 푸시

```bash
git add public/initial-data.json
git commit -m "Add: 초기 데이터 파일 추가 (거래 데이터 및 그룹 설정)"
git push origin main
```

## 4단계: 배포 확인

Render가 자동으로 재배포를 시작합니다.
배포 완료 후 사이트에 접속하면:

- ✅ 거래 데이터가 자동으로 로드됩니다
- ✅ 공급업체 그룹 분류가 적용됩니다

## 주의사항

### 초기 데이터 로드 조건

- `initial-data.json` 파일은 **localStorage가 비어있을 때만** 로드됩니다
- 이미 데이터가 있는 경우 기존 데이터를 유지합니다
- 브라우저 캐시를 지우면 초기 데이터가 다시 로드됩니다

### 데이터 업데이트 방법

배포 환경의 데이터를 업데이트하려면:

1. 로컬 환경에서 데이터 수정
2. 관리자 페이지에서 데이터 내보내기
3. `public/initial-data.json` 파일 교체
4. Git 커밋 및 푸시

## 데이터 구조

```json
{
  "supplierGroupOverrides": [
    {
      "businessNumber": "1234567890",
      "companyName": "회사명",
      "originalGroup": "A",
      "overrideGroup": "B",
      "subGroup": "B1"
    }
  ],
  "transactionData": {
    "transaction_data_1234567890": {
      "supplier_id": "...",
      "business_number": "1234567890",
      "transaction_amount": 1000000,
      "transaction_count": 5
    }
  },
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

## 문제 해결

### 데이터가 로드되지 않는 경우

1. 브라우저 콘솔에서 에러 확인 (F12)
2. `initial-data.json` 파일이 public 폴더에 있는지 확인
3. JSON 파일 형식이 올바른지 확인 (JSON validator 사용)

### 기존 데이터 초기화

브라우저 콘솔에서:

```javascript
localStorage.clear()
location.reload()
```

## 자동화 스크립트

편의를 위해 배치 파일을 제공합니다:

### `export-and-deploy.bat` (생성 예정)

```batch
@echo off
echo 1. 로컬 환경에서 데이터를 내보내세요
echo 2. 다운로드한 파일을 public\initial-data.json으로 복사하세요
pause

git add public\initial-data.json
git commit -m "Update: 초기 데이터 업데이트"
git push origin main

echo 배포 완료!
pause
```
