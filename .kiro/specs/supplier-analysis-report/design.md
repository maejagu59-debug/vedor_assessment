# Design Document

## Overview

공급업체 분석 보고서 자동 생성 웹 애플리케이션은 클라이언트 사이드에서 동작하는 단일 페이지 애플리케이션(SPA)입니다. React를 기반으로 하며, CSV 파일을 브라우저에서 직접 파싱하고 분석하여 전문가 수준의 보고서를 생성합니다. 백엔드 서버 없이 완전히 클라이언트에서 동작하므로 데이터 보안이 강화되고 배포가 간단합니다.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │              React Application                      │ │
│  │                                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │   UI Layer   │  │  State Mgmt  │               │ │
│  │  │  Components  │◄─┤   (Context)  │               │ │
│  │  └──────────────┘  └──────────────┘               │ │
│  │         │                  │                        │ │
│  │         ▼                  ▼                        │ │
│  │  ┌──────────────────────────────────┐             │ │
│  │  │      Business Logic Layer        │             │ │
│  │  │  - CSV Parser (PapaParse)        │             │ │
│  │  │  - Financial Calculator          │             │ │
│  │  │  - Analysis Text Generator       │             │ │
│  │  │  - Data Validator                │             │ │
│  │  └──────────────────────────────────┘             │ │
│  │         │                                           │ │
│  │         ▼                                           │ │
│  │  ┌──────────────────────────────────┐             │ │
│  │  │      Visualization Layer         │             │ │
│  │  │  - Chart.js Integration          │             │ │
│  │  └──────────────────────────────────┘             │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App
├── AppProvider (Context)
│   └── supplierData, statistics, filters
│
├── DashboardPage
│   ├── Header
│   │   ├── AppTitle
│   │   └── CSVUploadButton
│   ├── StatisticsSummary
│   │   ├── TotalCountCard
│   │   ├── AverageScoreCard
│   │   └── GradeDistributionCard
│   ├── SearchAndFilter
│   │   ├── SearchInput
│   │   └── GradeFilter
│   └── SupplierTable
│       └── SupplierRow (clickable)
│
└── ReportPage
    ├── BackButton
    ├── BasicInfoSection
    ├── FinancialAnalysisSection
    │   ├── MetricsTable
    │   ├── MetricsCharts
    │   └── ExpertCommentary
    ├── OperationalAnalysisSection
    │   ├── SafetyScoreDisplay
    │   ├── WorkforceAnalysis
    │   └── ExpertCommentary
    ├── OverallRecommendationSection
    │   └── StrategyText
    └── RawDataSection (expandable)
```

## Components and Interfaces

### 1. Data Models

#### SupplierRawData (CSV 원본 데이터)
```typescript
interface SupplierRawData {
  id: string;
  company_name: string;
  ceo_name: string;
  establishment_date: string;
  website: string;
  main_product: string;
  
  // 재무 데이터
  current_assets: number;
  current_liabilities: number;
  total_assets: number;
  total_liabilities: number;
  equity: number;
  current_year_sales: number;
  previous_year_sales: number;
  net_income: number;
  
  // 평가 데이터
  safety_questionnaire_score: number;
  safety_questionnaire_grade: string;
  regular_employees: number;
  technical_staff: number;
  quality_system_score: number;
  
  // 연락처
  contact_person: string;
  phone: string;
  email: string;
}
```

#### CalculatedMetrics (계산된 지표)
```typescript
interface CalculatedMetrics {
  liquidityRatio: number | null; // 유동비율 (%)
  debtToEquityRatio: number | null; // 부채비율 (%)
  netProfitMargin: number | null; // 순이익률 (%)
  salesGrowthRate: number | null; // 매출 증감률 (%)
}
```

#### AnalysisTexts (생성된 분석 텍스트)
```typescript
interface AnalysisTexts {
  financialAnalysis: string; // 재무 건전성 분석
  operationalAnalysis: string; // 운영/기술 역량 분석
  overallRecommendation: string; // 종합 의견 및 전략
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // 종합 리스크 레벨
}
```

#### SupplierReport (완전한 보고서 데이터)
```typescript
interface SupplierReport {
  rawData: SupplierRawData;
  metrics: CalculatedMetrics;
  analysis: AnalysisTexts;
}
```

#### AppState (애플리케이션 상태)
```typescript
interface AppState {
  suppliers: SupplierReport[];
  statistics: {
    totalCount: number;
    averageSafetyScore: number;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
    };
  };
  filters: {
    searchText: string;
    selectedGrade: string | null;
  };
  selectedSupplierId: string | null;
}
```

### 2. Core Business Logic Modules

#### CSVParser
```typescript
class CSVParser {
  /**
   * CSV 파일을 파싱하여 SupplierRawData 배열로 변환
   * PapaParse 라이브러리 사용
   */
  static async parseFile(file: File): Promise<SupplierRawData[]>;
  
  /**
   * 데이터 타입 변환 및 검증
   */
  static validateAndTransform(rawRow: any): SupplierRawData;
}
```

#### FinancialCalculator
```typescript
class FinancialCalculator {
  /**
   * 유동비율 계산: (유동자산 / 유동부채) * 100
   */
  static calculateLiquidityRatio(
    currentAssets: number,
    currentLiabilities: number
  ): number | null;
  
  /**
   * 부채비율 계산: (총부채 / 자기자본) * 100
   */
  static calculateDebtToEquityRatio(
    totalLiabilities: number,
    equity: number
  ): number | null;
  
  /**
   * 순이익률 계산: (순이익 / 당기매출액) * 100
   */
  static calculateNetProfitMargin(
    netIncome: number,
    currentYearSales: number
  ): number | null;
  
  /**
   * 매출 증감률 계산: ((당기매출 - 전기매출) / 전기매출) * 100
   */
  static calculateSalesGrowthRate(
    currentYearSales: number,
    previousYearSales: number
  ): number | null;
  
  /**
   * 모든 재무 지표 일괄 계산
   */
  static calculateAllMetrics(data: SupplierRawData): CalculatedMetrics;
}
```

#### AnalysisTextGenerator
```typescript
class AnalysisTextGenerator {
  /**
   * 재무 건전성 분석 텍스트 생성
   * 임계값 기반 조건부 로직 사용
   */
  static generateFinancialAnalysis(
    metrics: CalculatedMetrics,
    rawData: SupplierRawData
  ): string;
  
  /**
   * 운영/기술 역량 분석 텍스트 생성
   * 안전 점수, 인력 구성 등을 종합 분석
   */
  static generateOperationalAnalysis(
    rawData: SupplierRawData,
    allSuppliers: SupplierRawData[]
  ): string;
  
  /**
   * 종합 의견 및 거래 전략 생성
   * 재무 + 운영 분석 결과를 종합
   */
  static generateOverallRecommendation(
    financialAnalysis: string,
    operationalAnalysis: string,
    metrics: CalculatedMetrics,
    rawData: SupplierRawData
  ): { text: string; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' };
  
  /**
   * 완전한 분석 텍스트 생성
   */
  static generateCompleteAnalysis(
    supplier: SupplierRawData,
    allSuppliers: SupplierRawData[]
  ): AnalysisTexts;
}
```

### 3. Analysis Logic Details

#### 재무 건전성 분석 로직

**임계값 정의:**
```typescript
const FINANCIAL_THRESHOLDS = {
  liquidityRatio: {
    excellent: 200,  // 200% 이상
    good: 150,       // 150% 이상
    caution: 100,    // 100% 미만
  },
  debtToEquityRatio: {
    excellent: 100,  // 100% 미만
    good: 150,       // 150% 미만
    caution: 150,    // 150% 이상
  },
  netProfitMargin: {
    excellent: 10,   // 10% 이상
    good: 5,         // 5% 이상
    caution: 0,      // 0% 미만
  },
  salesGrowthRate: {
    excellent: 10,   // 10% 이상
    good: 0,         // 0% 이상
    caution: -5,     // -5% 미만
  },
};
```

**텍스트 생성 규칙:**
1. 각 지표를 임계값과 비교하여 점수 부여 (excellent: 2점, good: 1점, caution: 0점)
2. 총점에 따라 전반적인 평가 결정:
   - 7-8점: "매우 안정적인 재무 구조"
   - 5-6점: "양호한 재무 상태"
   - 3-4점: "재무 관리 주의 필요"
   - 0-2점: "재무 건전성 우려"
3. 특별히 우수하거나 취약한 지표를 구체적으로 언급

**예시 출력:**
```
"매우 안정적인 재무 구조를 갖추고 있습니다. 유동비율 250%로 단기 유동성이 우수하며, 
부채비율 80%로 자본 건전성이 양호합니다. 순이익률 12%와 매출 증가율 15%를 기록하여 
수익성과 성장성이 모두 뛰어납니다."
```

#### 운영/기술 역량 분석 로직

**평가 기준:**
```typescript
const OPERATIONAL_THRESHOLDS = {
  safetyScore: {
    // 백분위수 기반 평가
    top25Percent: null,    // 런타임에 계산
    bottom25Percent: null, // 런타임에 계산
  },
  technicalStaffRatio: {
    excellent: 0.3,  // 30% 이상
    good: 0.2,       // 20% 이상
    caution: 0.1,    // 10% 미만
  },
  qualitySystemScore: {
    excellent: 80,   // 80점 이상
    good: 60,        // 60점 이상
    caution: 60,     // 60점 미만
  },
};
```

**텍스트 생성 규칙:**
1. 안전 점수를 전체 공급업체 중 백분위수로 평가
2. 기술 인력 비율 = 기술 인력 / 정규 인력
3. 품질 시스템 점수 평가
4. 강점과 약점을 명확히 구분하여 서술

**예시 출력:**
```
"안전 관리 체계가 매우 우수합니다(상위 10%). 기술 인력 비율 35%로 핵심 역량 확보가 
잘 되어 있으며, 품질 시스템 점수 85점으로 체계적인 품질 관리가 이루어지고 있습니다. 
다만, 정규 인력 대비 기술 인력의 경력 관리 체계 강화가 필요합니다."
```

#### 종합 의견 및 거래 전략 로직

**리스크 레벨 결정:**
```typescript
function determineRiskLevel(
  financialScore: number,  // 0-8
  operationalScore: number // 0-6
): 'LOW' | 'MEDIUM' | 'HIGH' {
  const totalScore = financialScore + operationalScore;
  
  if (totalScore >= 11) return 'LOW';
  if (totalScore >= 7) return 'MEDIUM';
  return 'HIGH';
}
```

**전략 제언 매트릭스:**

| 리스크 레벨 | 재무 상태 | 운영 역량 | 전략 제언 |
|------------|----------|----------|----------|
| LOW | 우수 | 우수 | 전략적 파트너십, 장기 계약, 공동 기술 개발 |
| LOW | 우수 | 양호 | 장기 거래 관계 구축, 운영 개선 지원 |
| MEDIUM | 양호 | 양호 | 정기적 모니터링, 단계적 거래 확대 |
| MEDIUM | 우수 | 취약 | 조건부 거래, 운영 개선 계획 요구 |
| MEDIUM | 취약 | 우수 | 재무 개선 모니터링, 거래 금액 제한 |
| HIGH | 취약 | 취약 | 단기 거래 한정, 선급금 제한, 개선 계획 필수 |

### 4. UI Components Specifications

#### DashboardPage
- **목적**: 전체 공급업체 현황 파악 및 개별 공급업체 선택
- **주요 기능**:
  - CSV 업로드
  - 통계 요약 (카드 형식)
  - 검색 및 필터링
  - 공급업체 목록 테이블
- **반응형**: 모바일에서는 카드 레이아웃, 데스크톱에서는 테이블 레이아웃

#### ReportPage
- **목적**: 선택된 공급업체의 상세 분석 보고서 표시
- **섹션 구성**:
  1. 기본 정보 (회사명, CEO, 설립일, 웹사이트, 최종 등급)
  2. 재무 건전성 분석 (지표 + 차트 + 전문가 코멘트)
  3. 운영/기술 역량 분석 (점수 + 인력 구성 + 전문가 코멘트)
  4. 종합 의견 (리스크 레벨 + 거래 전략)
  5. 원본 데이터 (확장 가능)
- **인쇄 최적화**: CSS @media print 규칙 적용

#### Chart Components
- **사용 라이브러리**: Chart.js
- **차트 유형**:
  - Bar Chart: 재무 지표 비교
  - Gauge Chart: 개별 지표 상태 표시
  - Color Coding: 
    - Green (#10B981): 우수
    - Yellow (#F59E0B): 주의
    - Red (#EF4444): 우려

## Data Flow

### 1. CSV 업로드 플로우
```
User selects file
    ↓
CSVParser.parseFile()
    ↓
Validate each row
    ↓
Transform to SupplierRawData[]
    ↓
For each supplier:
    ├─ FinancialCalculator.calculateAllMetrics()
    └─ AnalysisTextGenerator.generateCompleteAnalysis()
    ↓
Create SupplierReport[]
    ↓
Update AppState
    ↓
Calculate statistics
    ↓
Render DashboardPage
```

### 2. 보고서 조회 플로우
```
User clicks supplier row
    ↓
Set selectedSupplierId in AppState
    ↓
Navigate to ReportPage
    ↓
Retrieve SupplierReport by ID
    ↓
Render all sections:
    ├─ BasicInfoSection
    ├─ FinancialAnalysisSection (with charts)
    ├─ OperationalAnalysisSection
    ├─ OverallRecommendationSection
    └─ RawDataSection
```

### 3. 검색/필터 플로우
```
User types in search or selects filter
    ↓
Update filters in AppState
    ↓
Filter suppliers array:
    ├─ Apply searchText filter (company_name contains)
    └─ Apply grade filter (safety_questionnaire_grade equals)
    ↓
Re-render SupplierTable with filtered results
```

## Error Handling

### 1. CSV 파싱 에러
- **시나리오**: 잘못된 파일 형식, 필수 컬럼 누락
- **처리**: 
  - 사용자에게 명확한 에러 메시지 표시
  - 어떤 컬럼이 누락되었는지 구체적으로 안내
  - 샘플 CSV 형식 다운로드 링크 제공

### 2. 데이터 검증 에러
- **시나리오**: 숫자 필드에 문자열, 음수 값 등
- **처리**:
  - 해당 필드를 null로 설정
  - 보고서에서 "N/A" 표시
  - 콘솔에 경고 로그 출력 (개발 모드)

### 3. 계산 에러
- **시나리오**: 0으로 나누기, 음수 제곱근 등
- **처리**:
  - 해당 지표를 null로 반환
  - UI에서 "계산 불가" 메시지 표시
  - 분석 텍스트에서 해당 지표 제외

### 4. 렌더링 에러
- **시나리오**: 차트 라이브러리 로드 실패, 메모리 부족
- **처리**:
  - Error Boundary로 에러 캐치
  - 폴백 UI 표시 (차트 대신 테이블)
  - 에러 리포트 로컬 저장

## Testing Strategy

### 1. Unit Tests
- **대상**: 
  - FinancialCalculator의 모든 계산 함수
  - AnalysisTextGenerator의 텍스트 생성 로직
  - CSVParser의 검증 및 변환 로직
- **도구**: Jest
- **커버리지 목표**: 80% 이상

### 2. Integration Tests
- **대상**:
  - CSV 업로드부터 보고서 생성까지 전체 플로우
  - 검색/필터 기능
  - 페이지 네비게이션
- **도구**: React Testing Library
- **시나리오**: 
  - 정상 CSV 파일 업로드
  - 비정상 데이터 처리
  - 대용량 데이터 (1000+ 공급업체)

### 3. Visual Tests
- **대상**: 
  - 모든 UI 컴포넌트
  - 반응형 레이아웃
  - 차트 렌더링
- **도구**: Storybook
- **브라우저**: Chrome, Firefox, Safari

### 4. Performance Tests
- **목표**:
  - CSV 파싱: 1000개 레코드 < 2초
  - 보고서 렌더링: < 1초
  - 검색/필터: < 500ms
- **도구**: Chrome DevTools Performance

## Security Considerations

### 1. 데이터 보안
- 모든 데이터는 클라이언트 메모리에만 저장
- 서버로 전송되지 않음
- 페이지 새로고침 시 데이터 삭제

### 2. XSS 방지
- React의 기본 XSS 보호 활용
- 사용자 입력 sanitization (DOMPurify)
- CSV 데이터의 HTML 태그 이스케이프

### 3. 파일 업로드 검증
- 파일 크기 제한: 10MB
- 파일 확장자 검증: .csv만 허용
- MIME 타입 검증

## Performance Optimization

### 1. 대용량 데이터 처리
- **가상 스크롤링**: react-window 사용하여 테이블 렌더링 최적화
- **메모이제이션**: React.memo, useMemo로 불필요한 재계산 방지
- **Web Worker**: CSV 파싱을 별도 스레드에서 처리 (선택적)

### 2. 번들 크기 최적화
- **Code Splitting**: React.lazy로 ReportPage 지연 로딩
- **Tree Shaking**: 사용하지 않는 Chart.js 모듈 제거
- **압축**: Gzip/Brotli 압축 적용

### 3. 렌더링 최적화
- **Debouncing**: 검색 입력 500ms 디바운스
- **Lazy Loading**: 차트는 뷰포트에 들어올 때만 렌더링
- **Image Optimization**: 로고 등 이미지 WebP 형식 사용

## Deployment

### 1. 빌드 설정
- **도구**: Vite (빠른 빌드 속도)
- **환경 변수**: 없음 (완전 클라이언트 앱)
- **출력**: 정적 HTML/CSS/JS 파일

### 2. 호스팅
- **추천 플랫폼**: 
  - Vercel (자동 배포)
  - Netlify (간편한 설정)
  - GitHub Pages (무료)
- **요구사항**: 정적 파일 호스팅만 필요

### 3. CI/CD
- **GitHub Actions**: 
  - PR 시 자동 테스트
  - main 브랜치 머지 시 자동 배포
  - 빌드 성공 여부 확인

## Future Enhancements

### Phase 2 (선택적)
1. **데이터 내보내기**: 보고서를 PDF로 다운로드
2. **비교 기능**: 여러 공급업체 나란히 비교
3. **히스토리 관리**: 과거 업로드 데이터 저장 (LocalStorage)
4. **커스텀 임계값**: 사용자가 분석 기준 조정 가능
5. **다국어 지원**: 영어/한국어 전환

### Phase 3 (선택적)
1. **AI 분석**: LLM을 활용한 더 정교한 분석 텍스트
2. **실시간 협업**: 여러 사용자가 동시에 분석
3. **API 연동**: 외부 신용평가 데이터 통합
