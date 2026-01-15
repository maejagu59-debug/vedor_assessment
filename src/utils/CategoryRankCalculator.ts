import { SupplierReport } from '../types';
import { EvaluationScoreCalculator } from './EvaluationScoreCalculator';

export interface SupplierRank {
  supplierId: string;
  companyName: string;
  mainProducts: string;
  safetyGrade: string;
  finalConvertedScore: number;
  rank: number;
}

export interface GroupRankings {
  A: SupplierRank[];
  B: SupplierRank[];
  C: SupplierRank[];
  D: SupplierRank[];
  E1: SupplierRank[];
  E2: SupplierRank[];
  E3: SupplierRank[];
  E4: SupplierRank[];
  G: SupplierRank[];
}

export class CategoryRankCalculator {
  /**
   * 공급업체 그룹별 순위 계산
   */
  static calculateGroupRankings(suppliers: SupplierReport[]): GroupRankings {
    const rankings: any = {};

    // A, B, C, D 그룹은 그대로
    ['A', 'B', 'C', 'D'].forEach(group => {
      rankings[group] = this.calculateGroupRank(suppliers, group);
    });

    // E 그룹은 E1~E4로 세분화
    ['E1', 'E2', 'E3', 'E4'].forEach(subGroup => {
      rankings[subGroup] = this.calculateGroupRank(suppliers, 'E', subGroup);
    });

    // G 그룹 (F, G, H 통합)
    rankings['G'] = this.calculateGroupRank(suppliers, 'G', undefined, ['F', 'G', 'H']);

    return rankings as GroupRankings;
  }

  /**
   * 특정 그룹의 순위 계산
   */
  private static calculateGroupRank(
    suppliers: SupplierReport[],
    group: string,
    subGroup?: string,
    includeGroups?: string[]
  ): SupplierRank[] {
    // 해당 그룹의 공급업체만 필터링 (오버라이드 적용)
    const groupSuppliers = suppliers.filter(s => {
      if (!s.evaluation) return false;
      
      // 오버라이드 확인
      try {
        const stored = localStorage.getItem('supplier_group_overrides');
        if (stored) {
          const overrides = JSON.parse(stored);
          const override = overrides.find((o: any) => o.businessNumber === s.rawData.business_number);
          if (override) {
            // 오버라이드가 있으면 그룹과 세부 그룹 모두 확인
            if (subGroup) {
              return override.overrideGroup === group && override.subGroup === subGroup;
            }
            if (includeGroups) {
              return includeGroups.includes(override.overrideGroup);
            }
            return override.overrideGroup === group;
          }
        }
      } catch (error) {
        console.error('그룹 오버라이드 확인 실패:', error);
      }
      
      // 오버라이드가 없으면 평가 데이터의 그룹 사용
      if (subGroup) {
        // E 그룹의 경우 세부 그룹이 없으면 기본값 사용
        const supplierSubGroup = this.getSupplierSubGroup(s.rawData.business_number);
        return s.evaluation.supplier_group === group && supplierSubGroup === subGroup;
      }
      
      if (includeGroups) {
        return includeGroups.includes(s.evaluation.supplier_group);
      }
      
      return s.evaluation.supplier_group === group;
    });

    if (groupSuppliers.length === 0) {
      return [];
    }

    // 모든 평가 데이터 수집
    const allEvaluations = groupSuppliers.map(s => s.evaluation!);

    // 최종 변환점수 계산 및 정렬
    const ranks: SupplierRank[] = groupSuppliers
      .map(supplier => {
        const evaluation = supplier.evaluation!;
        
        // 저장된 거래 데이터 로드
        let transactionAmount = 0;
        let transactionCount = 0;
        
        try {
          const storageKey = `transaction_data_${evaluation.business_number}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const data = JSON.parse(stored);
            transactionAmount = data.transaction_amount || 0;
            transactionCount = data.transaction_count || 0;
          }
        } catch (error) {
          console.error('거래 데이터 로드 실패:', error);
        }
        
        // 표준화 점수 계산 (거래 데이터 포함)
        const result = EvaluationScoreCalculator.applyStandardizedScoring(
          evaluation,
          allEvaluations,
          transactionAmount,
          transactionCount
        );
        
        return {
          supplierId: supplier.rawData.id,
          companyName: supplier.rawData.company_name,
          mainProducts: supplier.rawData.main_products_services || '-',
          safetyGrade: supplier.rawData.safety_questionnaire_grade,
          finalConvertedScore: result.finalConvertedScore,
          rank: 0, // 임시값
        };
      })
      .sort((a, b) => b.finalConvertedScore - a.finalConvertedScore); // 점수 높은 순으로 정렬

    // 순위 부여 (동점자 처리)
    let currentRank = 1;
    for (let i = 0; i < ranks.length; i++) {
      if (i > 0 && ranks[i].finalConvertedScore < ranks[i - 1].finalConvertedScore) {
        currentRank = i + 1;
      }
      ranks[i].rank = currentRank;
    }

    return ranks;
  }

  /**
   * 공급업체의 세부 그룹 가져오기
   */
  private static getSupplierSubGroup(businessNumber: string): string {
    try {
      const stored = localStorage.getItem('supplier_group_overrides');
      if (stored) {
        const overrides = JSON.parse(stored);
        const override = overrides.find((o: any) => o.businessNumber === businessNumber);
        if (override && override.subGroup) {
          return override.subGroup;
        }
      }
    } catch (error) {
      console.error('세부 그룹 확인 실패:', error);
    }
    // 기본값: E1
    return 'E1';
  }

  /**
   * 그룹명 가져오기
   */
  static getGroupName(group: string): string {
    // 기본값
    const defaultNames: Record<string, string> = {
      A: 'Group A - 주요 외주용역',
      B: 'Group B - 자재 (정비, 운영)',
      C: 'Group C - 연료비 (유류 외)',
      D: 'Group D - 시설공사',
      E1: 'Group E1 - 외주용역(냉동모니터링, 시설관리)',
      E2: 'Group E2 - One-Stop Service(줄잡이)',
      E3: 'Group E3 - 임직원복지관련 용역(구내식당, 통근버스, 구내셔틀버스)',
      E4: 'Group E4 - 기타용역',
      G: 'Group G - 소모품(기타) / 일반(기타)',
    };
    return defaultNames[group] || `${group}그룹`;
  }

  /**
   * 특정 공급업체의 그룹 내 순위 조회
   */
  static getSupplierRankInGroup(
    supplierId: string,
    rankings: GroupRankings
  ): SupplierRank | null {
    for (const group of Object.keys(rankings)) {
      const rank = (rankings as any)[group].find((r: SupplierRank) => r.supplierId === supplierId);
      if (rank) return rank;
    }
    return null;
  }
}
