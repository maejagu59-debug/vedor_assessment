import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppState, SupplierReport, Filters, Statistics, EvaluationData, AnalysisTexts } from '../types';
import { CSVParser } from '../utils/CSVParser';
import { EvaluationParser } from '../utils/EvaluationParser';
import { SuppliersParser, SupplierListData } from '../utils/SuppliersParser';
import { FinancialCalculator } from '../utils/FinancialCalculator';
import { AnalysisTextGenerator } from '../utils/AnalysisTextGenerator';
import { SupplierGroupManager } from '../utils/SupplierGroupManager';
import { DataExporter } from '../utils/DataExporter';

interface AppContextType extends AppState {
  uploadSupplierCSV: (file: File) => Promise<void>;
  uploadEvaluationCSV: (file: File) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  setSelectedSupplierId: (id: string | null) => void;
  getFilteredSuppliers: () => SupplierReport[];
  getSupplierById: (id: string) => SupplierReport | undefined;
  login: (password: string) => boolean;
  logout: () => void;
  updateSupplierAnalysis: (id: string, analysis: Partial<AnalysisTexts>) => void;
  suppliersList: SupplierListData[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_PASSWORD = '0070';

const initialState: AppState = {
  suppliers: [],
  statistics: {
    totalCount: 0,
    averageSafetyScore: 0,
    gradeDistribution: { S: 0, A: 0, B: 0, C: 0, D: 0 },
  },
  filters: {
    searchText: '',
    selectedGrade: null,
  },
  selectedSupplierId: null,
  isLoading: false,
  error: null,
  isAdmin: false,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [suppliersList, setSuppliersList] = useState<SupplierListData[]>([]);

  // 앱 시작 시 CSV 파일 자동 로드
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        // 초기 데이터 로드 (localStorage가 비어있을 때만)
        await DataExporter.loadInitialData();

        // 공급업체 목록 로드 (suppliers)
        const suppliersListResponse = await fetch('/suppliers-export-2025-11-17_08-41-15.csv');
        const suppliersListText = await suppliersListResponse.text();
        const suppliersListBlob = new Blob([suppliersListText], { type: 'text/csv' });
        const suppliersListFile = new File([suppliersListBlob], 'suppliers.csv', { type: 'text/csv' });
        const parsedSuppliersList = await SuppliersParser.parseFile(suppliersListFile);
        setSuppliersList(parsedSuppliersList);

        // 공급업체 정보 로드 (supplier_info)
        const supplierResponse = await fetch('/supplier_info-export-2025-12-16_11-10-36.csv');
        const supplierText = await supplierResponse.text();
        const supplierBlob = new Blob([supplierText], { type: 'text/csv' });
        const supplierFile = new File([supplierBlob], 'supplier_info.csv', { type: 'text/csv' });

        // 평가 데이터 로드
        const evaluationResponse = await fetch('/evaluations-export-2025-12-16_09-48-09.csv');
        const evaluationText = await evaluationResponse.text();
        const evaluationBlob = new Blob([evaluationText], { type: 'text/csv' });
        const evaluationFile = new File([evaluationBlob], 'evaluations.csv', { type: 'text/csv' });

        // 평가 데이터 먼저 파싱
        const parsedEvaluations = await EvaluationParser.parseFile(evaluationFile);
        
        // 중복 제거: 같은 사업자등록번호에 대해 최신 승인된 데이터 우선
        const deduplicatedEvaluations = parsedEvaluations.reduce((acc, evaluation) => {
          const existing = acc.find(e => e.business_number === evaluation.business_number);
          
          if (!existing) {
            acc.push(evaluation);
          } else {
            // 우선순위: approved > pending > draft
            const statusPriority = { approved: 3, pending: 2, draft: 1 };
            const currentPriority = statusPriority[evaluation.status as keyof typeof statusPriority] || 0;
            const existingPriority = statusPriority[existing.status as keyof typeof statusPriority] || 0;
            
            // 상태가 더 높은 우선순위이거나, 같은 상태에서 더 최신인 경우 교체
            if (currentPriority > existingPriority || 
                (currentPriority === existingPriority && evaluation.evaluation_date > existing.evaluation_date)) {
              const index = acc.findIndex(e => e.business_number === evaluation.business_number);
              acc[index] = evaluation;
            }
          }
          
          return acc;
        }, [] as EvaluationData[]);
        
        // 그룹 오버라이드 정보 병합
        const evaluationsWithOverrides = deduplicatedEvaluations.map(evaluation => {
          const override = SupplierGroupManager.getSupplierGroupOverride(evaluation.business_number);
          if (override) {
            return {
              ...evaluation,
              supplier_group: override.overrideGroup,
              detail_group: override.subGroup || undefined,
            };
          }
          return evaluation;
        });
        
        setEvaluations(evaluationsWithOverrides);

        // 공급업체 데이터 파싱
        const rawSuppliers = await CSVParser.parseFile(supplierFile);
        
        // 각 공급업체에 대해 지표 계산 및 분석 생성
        const suppliers: SupplierReport[] = rawSuppliers.map(rawData => {
          const metrics = FinancialCalculator.calculateAllMetrics(rawData);
          const analysis = AnalysisTextGenerator.generateCompleteAnalysis(
            rawData,
            metrics,
            rawSuppliers
          );

          // 평가 데이터 매칭 (오버라이드 적용된 데이터 사용)
          const evaluation = evaluationsWithOverrides.find(
            e => e.business_number === rawData.business_number
          );

          return {
            rawData,
            metrics,
            analysis,
            evaluation,
          };
        });

        // 통계 계산
        const statistics = calculateStatistics(suppliers);

        setState(prev => ({
          ...prev,
          suppliers,
          statistics,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'CSV 파일을 로드할 수 없습니다.',
        }));
      }
    };

    loadInitialData();
  }, []);

  /**
   * 통계 계산
   */
  const calculateStatistics = useCallback((suppliers: SupplierReport[]): Statistics => {
    const totalCount = suppliers.length;
    
    const averageSafetyScore = totalCount > 0
      ? suppliers.reduce((sum, s) => sum + s.rawData.safety_questionnaire_score, 0) / totalCount
      : 0;

    const gradeDistribution = suppliers.reduce(
      (acc, s) => {
        const grade = s.rawData.safety_questionnaire_grade;
        if (grade === 'S' || grade === 'A' || grade === 'B' || grade === 'C' || grade === 'D') {
          acc[grade]++;
        }
        return acc;
      },
      { S: 0, A: 0, B: 0, C: 0, D: 0 }
    );

    return {
      totalCount,
      averageSafetyScore,
      gradeDistribution,
    };
  }, []);

  /**
   * 공급업체 정보 CSV 업로드 및 처리
   */
  const uploadSupplierCSV = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 파일 검증
      const validation = CSVParser.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // CSV 파싱
      const rawSuppliers = await CSVParser.parseFile(file);
      
      if (rawSuppliers.length === 0) {
        throw new Error('유효한 공급업체 데이터가 없습니다.');
      }

      // 각 공급업체에 대해 지표 계산 및 분석 생성
      const suppliers: SupplierReport[] = rawSuppliers.map(rawData => {
        const metrics = FinancialCalculator.calculateAllMetrics(rawData);
        const analysis = AnalysisTextGenerator.generateCompleteAnalysis(
          rawData,
          metrics,
          rawSuppliers
        );

        // 평가 데이터 매칭 (business_number 기준)
        const evaluation = evaluations.find(
          e => e.business_number === rawData.business_number
        );

        return {
          rawData,
          metrics,
          analysis,
          evaluation,
        };
      });

      // 통계 계산
      const statistics = calculateStatistics(suppliers);

      setState(prev => ({
        ...prev,
        suppliers,
        statistics,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [calculateStatistics, evaluations]);

  /**
   * 평가 데이터 CSV 업로드 및 처리
   */
  const uploadEvaluationCSV = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // CSV 파싱
      const parsedEvaluations = await EvaluationParser.parseFile(file);
      
      if (parsedEvaluations.length === 0) {
        throw new Error('유효한 평가 데이터가 없습니다.');
      }

      setEvaluations(parsedEvaluations);

      // 기존 공급업체 데이터가 있으면 평가 데이터 매칭
      if (state.suppliers.length > 0) {
        const updatedSuppliers = state.suppliers.map(supplier => ({
          ...supplier,
          evaluation: parsedEvaluations.find(
            e => e.business_number === supplier.rawData.business_number
          ),
        }));

        setState(prev => ({
          ...prev,
          suppliers: updatedSuppliers,
          isLoading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [state.suppliers]);

  /**
   * 필터 설정
   */
  const setFilters = useCallback((newFilters: Partial<Filters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
      },
    }));
  }, []);

  /**
   * 선택된 공급업체 ID 설정
   */
  const setSelectedSupplierId = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedSupplierId: id,
    }));
  }, []);

  /**
   * 필터링된 공급업체 목록 가져오기
   */
  const getFilteredSuppliers = useCallback((): SupplierReport[] => {
    let filtered = [...state.suppliers];

    // 검색 필터
    if (state.filters.searchText) {
      const searchLower = state.filters.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.rawData.company_name.toLowerCase().includes(searchLower)
      );
    }

    // 등급 필터
    if (state.filters.selectedGrade) {
      filtered = filtered.filter(s =>
        s.rawData.safety_questionnaire_grade === state.filters.selectedGrade
      );
    }

    // 회사명 기준 정렬
    filtered.sort((a, b) =>
      a.rawData.company_name.localeCompare(b.rawData.company_name, 'ko')
    );

    return filtered;
  }, [state.suppliers, state.filters]);

  /**
   * ID로 공급업체 가져오기
   */
  const getSupplierById = useCallback((id: string): SupplierReport | undefined => {
    return state.suppliers.find(s => s.rawData.id === id);
  }, [state.suppliers]);

  /**
   * 관리자 로그인
   */
  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setState(prev => ({ ...prev, isAdmin: true }));
      return true;
    }
    return false;
  }, []);

  /**
   * 관리자 로그아웃
   */
  const logout = useCallback(() => {
    setState(prev => ({ ...prev, isAdmin: false }));
  }, []);

  /**
   * 공급업체 분석 내용 수정
   */
  const updateSupplierAnalysis = useCallback((id: string, analysis: Partial<AnalysisTexts>) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(supplier =>
        supplier.rawData.id === id
          ? {
              ...supplier,
              analysis: {
                ...supplier.analysis,
                ...analysis,
              },
            }
          : supplier
      ),
    }));
  }, []);

  const value: AppContextType = {
    ...state,
    uploadSupplierCSV,
    uploadEvaluationCSV,
    setFilters,
    setSelectedSupplierId,
    getFilteredSuppliers,
    getSupplierById,
    login,
    logout,
    updateSupplierAnalysis,
    suppliersList,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
