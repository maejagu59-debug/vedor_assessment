export interface SupplierRawData {
  id: string;
  company_name: string;
  ceo_name: string;
  establishment_date: string;
  website: string;
  main_products_services: string;
  
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
  safety_questionnaire_responses?: string; // JSON 문자열 (선택적)
  hq_employees: number;
  bct_office_employees: number;
  
  // 연락처
  bct_contact_name: string;
  bct_contact_phone: string;
  bct_contact_email: string;
  
  // 추가 필드
  business_number: string;
  hq_address: string;
  main_phone: string;
  main_email: string;
}

export interface EvaluationData {
  id: string;
  supplier_name: string;
  supplier_group: string;
  detail_group?: string; // 세부 그룹 (E1, E2, E3, E4 등)
  business_number: string;
  safety_passed: boolean;
  initiator: string;
  approver: string;
  evaluation_date: string;
  stability_score: number;
  stability_remarks: string;
  sustainability_score: number;
  sustainability_remarks: string;
  final_score: number;
  pass: boolean;
  status: string;
  stability_details: any;
  sustainability_details: any;
  // 거래 데이터 (선택적)
  transaction_amount?: number;
  transaction_count?: number;
  standardized_score?: number;
}

export interface CalculatedMetrics {
  liquidityRatio: number | null; // 유동비율 (%)
  debtToEquityRatio: number | null; // 부채비율 (%)
  netProfitMargin: number | null; // 순이익률 (%)
  salesGrowthRate: number | null; // 매출 증감률 (%)
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AnalysisTexts {
  financialAnalysis: string; // 재무 건전성 분석
  operationalAnalysis: string; // 운영/기술 역량 분석
  overallRecommendation: string; // 종합 의견 및 전략
  riskLevel: RiskLevel; // 종합 리스크 레벨
}

export interface SupplierReport {
  rawData: SupplierRawData;
  metrics: CalculatedMetrics;
  analysis: AnalysisTexts;
  evaluation?: EvaluationData; // 평가 데이터 (선택적)
  evaluationScore?: number; // 최종 변환점수 (M) - 종합 의견 생성에 사용
}

export interface GradeDistribution {
  S: number;
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface Statistics {
  totalCount: number;
  averageSafetyScore: number;
  gradeDistribution: GradeDistribution;
}

export interface Filters {
  searchText: string;
  selectedGrade: string | null;
}

export interface AppState {
  suppliers: SupplierReport[];
  statistics: Statistics;
  filters: Filters;
  selectedSupplierId: string | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
}
