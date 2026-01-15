# 공급업체 분석 보고서 자동 생성 웹 앱

CSV 파일을 업로드하여 공급업체에 대한 전문가 수준의 기업 분석 보고서를 자동으로 생성하는 웹 애플리케이션입니다.

## 주요 기능

- **CSV 파일 업로드**: 공급업체 평가 데이터를 CSV 형식으로 업로드
- **자동 재무 분석**: 유동비율, 부채비율, 순이익률, 매출 증감률 자동 계산
- **전문가 분석 텍스트**: 재무 건전성, 운영/기술 역량에 대한 전문가 수준의 분석 자동 생성
- **리스크 평가**: LOW/MEDIUM/HIGH 리스크 레벨 자동 판정
- **거래 전략 제언**: 각 공급업체에 대한 구체적인 구매 전략 제시
- **거래 데이터 분석**: 9개월 거래 이력 기반 표준화 점수 계산 및 공급업체 중요도 평가
- **첨부 서류 관리**: 공급업체별 PDF 파일 업로드/다운로드 (IndexedDB 로컬 저장)
- **시각화**: Chart.js를 활용한 재무 지표 차트
- **검색 및 필터**: 공급업체명 검색, 등급별 필터링
- **인쇄 최적화**: 보고서 인쇄 기능 지원

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Chart.js + react-chartjs-2
- **CSV Parsing**: PapaParse
- **Build Tool**: Vite

## 설치 방법

### 방법 1: 더블클릭으로 실행 (Windows)

1. `start.bat` 파일을 더블클릭합니다
2. 자동으로 의존성이 설치되고 개발 서버가 시작됩니다
3. 브라우저에서 `http://localhost:5173`을 열어주세요

### 방법 2: 수동 설치

#### 1. 의존성 설치

```bash
npm install
```

#### 1-1. 거래 데이터 분석 기능 사용 시 추가 설치

거래 데이터 Excel 파일(9monthTransaction.xlsx) 분석 기능을 사용하려면:

```bash
npm install xlsx
npm install --save-dev @types/xlsx
```

#### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

#### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 사용 방법

### 1. CSV 파일 준비

CSV 파일은 세미콜론(;)으로 구분되며 다음 필드를 포함해야 합니다:

#### 필수 필드
- `company_name`: 회사명
- `ceo_name`: 대표자명

#### 재무 데이터 필드
- `current_assets`: 유동자산
- `current_liabilities`: 유동부채
- `total_assets`: 총자산
- `total_liabilities`: 총부채
- `equity`: 자기자본
- `current_year_sales`: 당기 매출액
- `previous_year_sales`: 전기 매출액
- `net_income`: 순이익

#### 평가 데이터 필드
- `safety_questionnaire_score`: 안전 설문 점수
- `safety_questionnaire_grade`: 안전 등급 (S/A/B/C/D)
- `hq_employees`: 본사 인력 수
- `bct_office_employees`: BCT 사무소 인력 수

#### 기타 필드
- `id`: 고유 ID (선택사항, 없으면 자동 생성)
- `business_number`: 사업자번호
- `establishment_date`: 설립일
- `website`: 웹사이트
- `main_products_services`: 주요 제품/서비스
- `hq_address`: 본사 주소
- `main_phone`: 대표 전화
- `main_email`: 대표 이메일
- `bct_contact_name`: BCT 담당자
- `bct_contact_phone`: BCT 연락처
- `bct_contact_email`: BCT 이메일

### 2. CSV 파일 업로드

1. 대시보드 상단의 "CSV 업로드" 버튼 클릭
2. CSV 파일 선택
3. 자동으로 데이터 파싱 및 분석 시작

### 3. 공급업체 목록 확인

- 전체 공급업체 수, 평균 안전 점수, 등급 분포 확인
- 검색창에서 회사명으로 검색
- 등급 필터로 특정 등급만 표시

### 4. 상세 보고서 조회

- 공급업체 목록에서 행 클릭
- 5개 섹션으로 구성된 상세 분석 보고서 확인:
  1. 기업 기본 정보
  2. 재무 건전성 분석
  3. 운영 및 기술 역량 분석
  4. 종합 의견 및 거래 전략
  5. 원본 데이터

### 5. 거래 데이터 입력 (관리자만)

공급업체별 거래 데이터를 입력하여 표준변환 점수를 계산합니다.

#### 방법 1: 일괄 입력 (권장)

1. 대시보드 상단의 "거래데이터" 버튼 클릭
2. 거래 데이터 관리 페이지로 이동
3. 표 형식으로 모든 공급업체의 데이터 확인
4. 각 공급업체별로 거래금액(억원)과 거래횟수(회) 입력
5. "전체 저장" 버튼 클릭

**추가 기능:**
- **검색**: 공급업체명 또는 사업자번호로 검색
- **필터**: 카테고리별 필터링
- **CSV 가져오기**: CSV 파일에서 데이터 일괄 불러오기
- **CSV 내보내기**: 현재 데이터를 CSV 파일로 저장
- **통계 표시**: 총 공급업체 수, 총 거래금액, 총 거래횟수

#### 방법 2: 개별 입력

1. 공급업체 상세 보고서 페이지로 이동
2. "거래 데이터" 섹션에서 "수정" 버튼 클릭
3. 거래금액 입력 (억원 단위): 예) 15.5 (15억 5천만원)
4. 거래횟수 입력 (회): 예) 120 (120회)
5. "저장" 버튼 클릭
6. 자동으로 표준변환 점수 재계산

**저장 위치:** 브라우저 LocalStorage (공급업체별 독립 저장)

### 6. 첨부 서류 관리

#### 파일 업로드 (관리자만)
1. 공급업체 상세 보고서 페이지로 이동
2. "첨부 서류" 섹션에서 파일 업로드 영역 확인
3. 설명 입력 (선택사항): 예) "사업자등록증", "재무제표" 등
4. "PDF 파일 선택" 버튼 클릭하여 파일 선택
5. 여러 파일을 동시에 선택 가능 (최대 50MB/파일)
6. 자동으로 브라우저 로컬 저장소(IndexedDB)에 저장

#### 파일 다운로드 (모든 사용자)
1. 첨부 서류 목록에서 다운로드 아이콘 클릭
2. 파일이 자동으로 다운로드됨

#### 파일 삭제 (관리자만)
1. 첨부 서류 목록에서 삭제 아이콘 클릭
2. 확인 후 파일 삭제

**주의사항:**
- PDF 파일만 업로드 가능
- 파일은 브라우저 로컬 저장소(IndexedDB)에 저장됨
- 브라우저 데이터를 삭제하면 파일도 함께 삭제됨
- 다른 브라우저나 기기에서는 접근 불가

### 7. 보고서 인쇄

- 보고서 페이지 상단의 "인쇄" 버튼 클릭
- 브라우저 인쇄 기능 사용

## 샘플 데이터

프로젝트 루트의 `sample-data.csv` 파일을 사용하여 테스트할 수 있습니다.

```bash
# 샘플 데이터 파일 위치
./sample-data.csv
```

## 분석 로직

### 공급업체 평가 시스템

본 시스템은 **2가지 평가**를 통해 승인 공급업체를 선정합니다:

1. **적격수급업체 평가**: 산업안전보건법에 따른 안전 질의서 평가
2. **공급업체 평가**: 원점수 기반 표준변환 점수 계산

**두 평가 모두 통과해야 승인 공급업체로 선정됩니다.**

#### 표준변환 점수 계산 산식

**표준변환 증감점수 (L):**
```
L = ((F-G)/H × I × 20) + (J × K × 0.001)
```

**최종 변환점수 (M):**
```
M = F + L
```

**변수 설명:**
- **F**: 원점수 (평가 점수)
- **G**: 카테고리 평균점수 (AVERAGE 함수)
- **H**: 카테고리 표준편차 (STDEV 함수)
- **I**: 카테고리 가중치
- **J**: 거래금액 (억원 단위)
- **K**: 거래횟수 (회)
- **L**: 표준변환 증감점수
- **M**: 최종 변환점수

**카테고리별 가중치 (I):**
- Group A: 25%
- Group B: 5%
- Group C: 15%
- Group D: 3%
- Group E: 3%
- Group H: 1%

**등급 기준 (최종 변환점수 M 기준):**
- **90점 이상**: 우수 협력사
- **80점 이상**: 준수한 협력사
- **60점 이상 80점 미만**: 승인 공급업체 (다소 미흡)
- **60점 미만**: 제외 대상 (자격조건 충족 시까지)

### 재무 건전성 분석

**계산 지표:**
- 유동비율 = (유동자산 / 유동부채) × 100
- 부채비율 = (총부채 / 자기자본) × 100
- 순이익률 = (순이익 / 당기매출액) × 100
- 매출 증감률 = ((당기매출 - 전기매출) / 전기매출) × 100

**평가 기준:**
- 유동비율: 200% 이상 우수, 150% 이상 양호
- 부채비율: 100% 미만 우수, 150% 미만 양호
- 순이익률: 10% 이상 우수, 5% 이상 양호
- 매출 증감률: 10% 이상 우수, 0% 이상 양호

### 운영/기술 역량 분석

**평가 항목:**
- 안전 점수: 전체 공급업체 중 백분위수로 평가
- 기술 인력 비율: (기술 인력 / 정규 인력) × 100
- 품질 시스템 점수: 80점 이상 우수, 60점 이상 양호

### 리스크 레벨 결정

재무 점수와 운영 점수를 합산하여 결정:
- **LOW**: 총점 11점 이상 - 전략적 파트너십 권장
- **MEDIUM**: 총점 7-10점 - 조건부 거래 및 모니터링
- **HIGH**: 총점 6점 이하 - 거래 제한 및 개선 요구

## 프로젝트 구조

```
supplier-analysis-app/
├── src/
│   ├── components/
│   │   ├── dashboard/          # 대시보드 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── StatisticsSummary.tsx
│   │   │   ├── SearchAndFilter.tsx
│   │   │   └── SupplierTable.tsx
│   │   ├── report/             # 보고서 컴포넌트
│   │   │   ├── BasicInfoSection.tsx
│   │   │   ├── FinancialAnalysisSection.tsx
│   │   │   ├── FinancialMetricsChart.tsx
│   │   │   ├── OperationalAnalysisSection.tsx
│   │   │   ├── OverallRecommendationSection.tsx
│   │   │   ├── EvaluationSection.tsx
│   │   │   ├── AttachmentsSection.tsx  # 첨부 서류 관리
│   │   │   ├── EditableAnalysis.tsx
│   │   │   └── RawDataSection.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSpinner.tsx
│   ├── contexts/
│   │   └── AppContext.tsx      # 전역 상태 관리
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   └── ReportPage.tsx
│   ├── types/
│   │   └── index.ts            # TypeScript 타입 정의
│   ├── utils/
│   │   ├── CSVParser.ts        # CSV 파싱 로직
│   │   ├── FinancialCalculator.ts  # 재무 계산 로직
│   │   ├── AnalysisTextGenerator.ts # 분석 텍스트 생성
│   │   ├── EvaluationParser.ts # 평가 데이터 파싱
│   │   ├── EvaluationAnalyzer.ts # 평가 분석 로직
│   │   ├── EvaluationScoreCalculator.ts # 표준화 점수 계산
│   │   ├── TransactionParser.ts # 거래 데이터 파싱
│   │   └── FileStorageManager.ts # 파일 저장 관리 (IndexedDB)
│   ├── constants/
│   │   └── thresholds.ts       # 평가 기준 상수
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── sample-data.csv             # 샘플 데이터
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 배포

### Vercel 배포

1. Vercel 계정 생성 및 로그인
2. GitHub 저장소 연결
3. 자동 배포 설정 완료

### Netlify 배포

1. Netlify 계정 생성 및 로그인
2. "New site from Git" 선택
3. 저장소 연결 및 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`

### GitHub Pages 배포

```bash
# vite.config.ts에 base 설정 추가
export default defineConfig({
  base: '/repository-name/',
  plugins: [react()],
})

# 빌드 및 배포
npm run build
# dist 폴더를 gh-pages 브랜치에 푸시
```

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

MIT License

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
