import { EvaluationData } from '../types';

export interface EvaluationAnalysis {
  category: string;
  categoryName: string;
  totalScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  groupComparison: string;
}

export class EvaluationAnalysisGenerator {
  /**
   * 평가 데이터 분석 생성
   */
  static generateAnalysis(
    evaluation: EvaluationData,
    allEvaluations: EvaluationData[]
  ): EvaluationAnalysis {
    const category = evaluation.supplier_group;
    const categoryName = this.getCategoryName(category);
    
    // 그룹 내 평균 계산
    const groupEvaluations = allEvaluations.filter(e => e.supplier_group === category);
    const groupAverage = groupEvaluations.length > 0
      ? groupEvaluations.reduce((sum, e) => sum + e.final_score, 0) / groupEvaluations.length
      : 0;

    // 평가 항목 분석
    const items = evaluation.sustainability_details?.items || {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // 항목별 점수 분석 (5점 만점 기준)
    Object.entries(items).forEach(([key, value]) => {
      const score = Number(value) || 0;
      const itemName = this.getItemName(key);
      
      if (score >= 5) {
        strengths.push(`${itemName} (${score}점)`);
      } else if (score <= 3) {
        weaknesses.push(`${itemName} (${score}점)`);
      }
    });

    // 요약 생성
    const summary = this.generateSummary(evaluation, groupAverage, strengths.length, weaknesses.length);
    
    // 그룹 비교 분석
    const groupComparison = this.generateGroupComparison(evaluation, groupAverage, groupEvaluations.length);

    return {
      category,
      categoryName,
      totalScore: evaluation.final_score,
      strengths: strengths.slice(0, 5), // 상위 5개
      weaknesses: weaknesses.slice(0, 5), // 상위 5개
      summary,
      groupComparison,
    };
  }

  /**
   * 카테고리명 가져오기
   */
  private static getCategoryName(category: string): string {
    const names: Record<string, string> = {
      A: 'Group A - 주요 외주용역',
      B: 'Group B - 자재 (정비, 운영)',
      C: 'Group C - 연료비 (유류 외)',
      D: 'Group D - 시설공사',
      E: 'Group E - 외주용역',
      F: 'Group F - One-Stop Service',
      G: 'Group G - 소모품/일반',
      H: 'Group H - 기타',
    };
    return names[category] || `${category} 그룹`;
  }

  /**
   * 평가 항목명 가져오기
   */
  private static getItemName(key: string): string {
    const names: Record<string, string> = {
      // 공통 항목
      performanceAmount: '실적금액',
      performanceCount: '실적횟수',
      contractSupport: '계약지원',
      damagePrevention: '손해예방',
      regulationCompliance: '법규준수',
      
      // 자재/제품 관련
      qualityMgmt: '품질관리',
      deliveryMgmt: '납기관리',
      timelyDelivery: '적기납품',
      urgentResponse: '긴급대응',
      productVariety: '제품다양성',
      durability: '내구성',
      claimFrequency: '클레임빈도',
      quotationDelay: '견적지연',
      specResponse: '사양대응',
      
      // 용역 관련
      safetyService: '안전서비스',
      serviceQuality: '서비스품질',
      emergencyResponse: '비상대응',
      directiveCompliance: '지시준수',
      adequatePersonnel: '적정인력',
      turnoverRate: '이직률',
      
      // 추가 항목
      designSupport: '설계지원',
      regularWorkforce: '정규인력',
      technicalPersonnel: '기술인력',
      professionalCertification: '전문자격',
      equipmentMaintenance: '장비유지',
      safetyTraining: '안전교육',
      documentManagement: '문서관리',
      communicationSkill: '의사소통',
      problemSolving: '문제해결',
      customerSatisfaction: '고객만족',
      innovationCapability: '혁신역량',
      costCompetitiveness: '가격경쟁력',
      financialStability: '재무안정성',
      businessEthics: '기업윤리',
      environmentalManagement: '환경관리',
      socialResponsibility: '사회책임',
    };
    return names[key] || key;
  }

  /**
   * 요약 생성
   */
  private static generateSummary(
    evaluation: EvaluationData,
    groupAverage: number,
    strengthCount: number,
    weaknessCount: number
  ): string {
    const score = evaluation.final_score;
    const diff = score - groupAverage;
    const diffText = diff >= 0 
      ? `카테고리 평균보다 ${diff.toFixed(1)}점 높습니다`
      : `카테고리 평균보다 ${Math.abs(diff).toFixed(1)}점 낮습니다`;

    let summary = `공급업체 평가 결과 총 ${score.toFixed(1)}점을 획득하였으며, ${diffText}. `;

    if (strengthCount > 0 && weaknessCount === 0) {
      summary += '전반적으로 우수한 평가를 받았으며, 특히 여러 항목에서 만점을 기록했습니다.';
    } else if (strengthCount > weaknessCount) {
      summary += '대체로 양호한 평가를 받았으나, 일부 개선이 필요한 항목이 있습니다.';
    } else if (weaknessCount > strengthCount) {
      summary += '여러 항목에서 개선이 필요한 것으로 평가되었습니다.';
    } else {
      summary += '강점과 약점이 혼재된 평가 결과를 보였습니다.';
    }

    return summary;
  }

  /**
   * 그룹 비교 분석 생성
   */
  private static generateGroupComparison(
    evaluation: EvaluationData,
    groupAverage: number,
    groupSize: number
  ): string {
    const score = evaluation.final_score;
    const diff = score - groupAverage;
    const percentile = this.calculatePercentile(score, groupAverage, diff);

    let comparison = `${evaluation.supplier_group} 그룹 내 ${groupSize}개 업체 중 `;

    if (percentile >= 75) {
      comparison += '상위권에 위치하고 있습니다. ';
    } else if (percentile >= 50) {
      comparison += '중상위권에 위치하고 있습니다. ';
    } else if (percentile >= 25) {
      comparison += '중하위권에 위치하고 있습니다. ';
    } else {
      comparison += '하위권에 위치하고 있습니다. ';
    }

    if (Math.abs(diff) < 5) {
      comparison += '그룹 평균과 유사한 수준의 평가를 받았습니다.';
    } else if (diff >= 10) {
      comparison += '그룹 평균을 크게 상회하는 우수한 평가를 받았습니다.';
    } else if (diff >= 5) {
      comparison += '그룹 평균을 상회하는 양호한 평가를 받았습니다.';
    } else if (diff <= -10) {
      comparison += '그룹 평균을 크게 하회하여 개선이 시급합니다.';
    } else {
      comparison += '그룹 평균을 하회하여 개선이 필요합니다.';
    }

    return comparison;
  }

  /**
   * 백분위 계산 (간이)
   */
  private static calculatePercentile(_score: number, _average: number, diff: number): number {
    // 표준편차를 10으로 가정한 간이 계산
    const stdDev = 10;
    const zScore = diff / stdDev;
    
    // z-score를 백분위로 변환 (간이)
    if (zScore >= 1) return 85;
    if (zScore >= 0.5) return 70;
    if (zScore >= 0) return 55;
    if (zScore >= -0.5) return 40;
    if (zScore >= -1) return 25;
    return 15;
  }
}
