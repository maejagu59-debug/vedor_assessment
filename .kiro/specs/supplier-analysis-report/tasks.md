# Implementation Plan

- [x] 1. 프로젝트 초기 설정 및 기본 구조 구축


  - Vite + React + TypeScript 프로젝트 생성
  - Tailwind CSS 설정 및 기본 스타일 구성
  - 프로젝트 폴더 구조 생성 (components, utils, types, contexts)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



- [ ] 2. 데이터 모델 및 타입 정의
  - TypeScript 인터페이스 정의 (SupplierRawData, CalculatedMetrics, AnalysisTexts, SupplierReport, AppState)




  - 상수 정의 (FINANCIAL_THRESHOLDS, OPERATIONAL_THRESHOLDS)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3. CSV 파싱 및 데이터 처리 로직 구현
  - [x] 3.1 CSVParser 클래스 구현

    - PapaParse 라이브러리 설치 및 통합
    - parseFile 메서드 구현 (CSV 파일을 SupplierRawData[]로 변환)
    - validateAndTransform 메서드 구현 (데이터 검증 및 타입 변환)
    - 에러 처리 로직 (잘못된 형식, 누락된 필드)




    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 3.2 데이터 검증 및 정제 로직
    - 필수 필드 검증 함수
    - 숫자 필드 변환 및 유효성 검사
    - 누락/비정상 데이터 처리 (null 설정, 경고 로그)



    - _Requirements: 1.4_

- [ ] 4. 재무 지표 계산 로직 구현
  - [ ] 4.1 FinancialCalculator 클래스 구현
    - calculateLiquidityRatio 메서드 (유동비율)
    - calculateDebtToEquityRatio 메서드 (부채비율)

    - calculateNetProfitMargin 메서드 (순이익률)
    - calculateSalesGrowthRate 메서드 (매출 증감률)
    - calculateAllMetrics 메서드 (모든 지표 일괄 계산)
    - 0으로 나누기 등 예외 처리
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. 분석 텍스트 자동 생성 로직 구현

  - [ ] 5.1 재무 건전성 분석 텍스트 생성
    - generateFinancialAnalysis 메서드 구현
    - 임계값 기반 점수 계산 로직
    - 조건별 텍스트 템플릿 정의
    - 지표별 평가 문구 조합 로직
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  
  - [ ] 5.2 운영/기술 역량 분석 텍스트 생성
    - generateOperationalAnalysis 메서드 구현



    - 안전 점수 백분위수 계산 로직
    - 기술 인력 비율 계산 및 평가
    - 품질 시스템 점수 평가
    - 강점/약점 구분 서술 로직
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  
  - [ ] 5.3 종합 의견 및 거래 전략 생성
    - generateOverallRecommendation 메서드 구현
    - 리스크 레벨 결정 로직 (LOW/MEDIUM/HIGH)
    - 전략 제언 매트릭스 구현



    - 재무 + 운영 분석 결과 종합 로직
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 5.4 AnalysisTextGenerator 통합
    - generateCompleteAnalysis 메서드 구현 (전체 분석 생성)

    - 모든 분석 모듈 통합 및 테스트
    - _Requirements: 6.4, 7.4, 8.4_

- [ ] 6. 상태 관리 구현
  - [ ] 6.1 AppContext 생성
    - Context 및 Provider 컴포넌트 구현

    - AppState 초기값 정의
    - 상태 업데이트 함수들 (setSuppliers, setFilters, setSelectedSupplierId)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 6.2 통계 계산 로직
    - 전체 공급업체 수 계산

    - 평균 안전 점수 계산
    - 등급 분포 계산 (A/B/C/D)
    - 통계 자동 업데이트 로직
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7. Dashboard 페이지 UI 구현
  - [x] 7.1 Header 컴포넌트

    - 앱 제목 표시
    - CSV 업로드 버튼 구현
    - 파일 선택 핸들러 연결
    - _Requirements: 1.1_



  
  - [ ] 7.2 StatisticsSummary 컴포넌트
    - TotalCountCard (전체 공급업체 수)
    - AverageScoreCard (평균 안전 점수)
    - GradeDistributionCard (등급 분포 A/B/C/D)

    - 카드 레이아웃 및 스타일링
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 7.3 SearchAndFilter 컴포넌트
    - 검색 입력 필드 구현
    - 등급 필터 드롭다운 구현
    - 검색/필터 상태 업데이트 로직

    - 디바운싱 적용 (500ms)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 7.4 SupplierTable 컴포넌트
    - 테이블 헤더 및 컬럼 정의
    - SupplierRow 컴포넌트 (회사명, CEO, 제품, 등급, 재무 요약)

    - 행 클릭 이벤트 핸들러 (보고서 페이지로 이동)
    - 정렬 기능 (회사명 기준)
    - 가상 스크롤링 적용 (react-window)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  

  - [ ] 7.5 DashboardPage 통합
    - 모든 하위 컴포넌트 조합
    - 반응형 레이아웃 구현
    - 로딩 상태 표시

    - _Requirements: 1.1, 2.4, 3.4, 4.4_

- [ ] 8. Report 페이지 UI 구현
  - [ ] 8.1 BasicInfoSection 컴포넌트
    - 기업명, CEO, 설립일, 웹사이트 표시

    - 최종 안전 등급 및 점수 표시
    - 카드 형식 레이아웃
    - _Requirements: 9.1_
  
  - [x] 8.2 FinancialAnalysisSection 컴포넌트

    - MetricsTable (지표 이름, 값, 평가 표시)

    - MetricsCharts (Chart.js 바 차트/게이지 차트)
    - 색상 코딩 (green/yellow/red)
    - ExpertCommentary (전문가 분석 텍스트)
    - N/A 처리 (계산 불가 지표)

    - _Requirements: 9.2, 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 8.3 OperationalAnalysisSection 컴포넌트
    - SafetyScoreDisplay (안전 점수 및 백분위수)
    - WorkforceAnalysis (정규/기술 인력 구성)

    - 진행률 바 또는 차트

    - ExpertCommentary (운영/기술 분석 텍스트)
    - _Requirements: 9.2_
  
  - [x] 8.4 OverallRecommendationSection 컴포넌트

    - 리스크 레벨 배지 (LOW/MEDIUM/HIGH)
    - 거래 전략 텍스트 표시
    - 강조 스타일링
    - _Requirements: 9.2_
  
  - [x] 8.5 RawDataSection 컴포넌트

    - 확장/축소 가능한 섹션
    - 원본 CSV 데이터 테이블 또는 JSON 형식 표시
    - _Requirements: 9.3_
  

  - [x] 8.6 ReportPage 통합

    - BackButton (대시보드로 돌아가기)
    - 모든 섹션 조합
    - 인쇄 최적화 CSS
    - 1초 이내 렌더링 보장
    - _Requirements: 9.1, 9.2, 9.3, 9.4_


- [ ] 9. 라우팅 및 네비게이션 구현
  - React Router 설치 및 설정
  - 라우트 정의 (/ → Dashboard, /report/:id → Report)

  - 네비게이션 로직 (공급업체 선택 시 이동)
  - _Requirements: 4.2, 9.1_



- [ ] 10. Chart.js 통합 및 시각화
  - [ ] 10.1 Chart.js 설치 및 설정
    - react-chartjs-2 라이브러리 설치
    - 기본 차트 설정 및 테마
    - _Requirements: 10.1, 10.4_

  
  - [ ] 10.2 재무 지표 차트 컴포넌트
    - BarChart 컴포넌트 (여러 지표 비교)
    - GaugeChart 컴포넌트 (개별 지표 상태)

    - 색상 코딩 적용
    - 반응형 차트 크기
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 11. 에러 처리 및 사용자 피드백
  - [ ] 11.1 에러 바운더리 구현
    - ErrorBoundary 컴포넌트
    - 폴백 UI (에러 메시지 표시)
    - _Requirements: 1.2_
  
  - [ ] 11.2 CSV 업로드 에러 처리
    - 파일 형식 검증 (확장자, MIME 타입)
    - 파일 크기 제한 (10MB)
    - 에러 메시지 모달 또는 토스트
    - 샘플 CSV 다운로드 링크
    - _Requirements: 1.2, 1.4_
  
  - [ ] 11.3 로딩 상태 표시
    - 스피너 컴포넌트
    - CSV 파싱 중 로딩 표시
    - 보고서 생성 중 로딩 표시
    - _Requirements: 2.4, 9.4_

- [ ] 12. 성능 최적화
  - [ ] 12.1 메모이제이션 적용
    - React.memo로 컴포넌트 최적화
    - useMemo로 계산 결과 캐싱
    - useCallback으로 함수 참조 안정화
    - _Requirements: 3.3, 4.3, 9.4, 10.4_
  
  - [x] 12.2 코드 스플리팅


    - React.lazy로 ReportPage 지연 로딩
    - Suspense 경계 설정
    - _Requirements: 9.4_
  
  - [ ] 12.3 검색 디바운싱
    - 검색 입력 500ms 디바운스 적용
    - _Requirements: 3.3_

- [ ] 13. 보안 강화
  - [ ] 13.1 XSS 방지
    - DOMPurify 라이브러리 설치
    - CSV 데이터 sanitization
    - HTML 태그 이스케이프
    - _Requirements: 1.3, 1.4_
  
  - [ ] 13.2 파일 업로드 보안
    - 파일 확장자 화이트리스트 (.csv만)
    - MIME 타입 검증
    - 파일 크기 제한
    - _Requirements: 1.2_

- [ ] 14. 반응형 디자인 구현
  - 모바일 레이아웃 (< 768px)
  - 태블릿 레이아웃 (768px - 1024px)
  - 데스크톱 레이아웃 (> 1024px)
  - 터치 인터페이스 최적화
  - _Requirements: 4.3, 9.1_

- [ ] 15. 최종 통합 및 테스트
  - [ ] 15.1 전체 플로우 통합 테스트
    - CSV 업로드부터 보고서 생성까지 E2E 테스트
    - 다양한 데이터 시나리오 테스트
    - 대용량 데이터 (1000+ 레코드) 테스트
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.4_
  
  - [ ] 15.2 브라우저 호환성 테스트
    - Chrome, Firefox, Safari 테스트
    - 모바일 브라우저 테스트
    - _Requirements: 9.1, 9.4_
  
  - [ ] 15.3 성능 벤치마크
    - CSV 파싱 속도 측정 (< 2초)
    - 보고서 렌더링 속도 측정 (< 1초)
    - 검색/필터 응답 속도 측정 (< 500ms)
    - _Requirements: 2.4, 3.3, 9.4, 10.4_

- [ ] 16. 배포 준비
  - [ ] 16.1 프로덕션 빌드 설정
    - Vite 빌드 최적화 설정
    - 환경 변수 설정 (필요시)
    - 번들 크기 분석 및 최적화
    - _Requirements: 모든 요구사항_
  
  - [ ] 16.2 배포 문서 작성
    - README.md (프로젝트 설명, 설치 방법, 사용법)
    - 샘플 CSV 파일 제공
    - 배포 가이드 (Vercel/Netlify)
    - _Requirements: 1.1_
