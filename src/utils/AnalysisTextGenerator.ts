import { SupplierRawData, CalculatedMetrics, AnalysisTexts, RiskLevel } from '../types';
import { FINANCIAL_THRESHOLDS } from '../constants/thresholds';

export class AnalysisTextGenerator {
  /**
   * 재무 건전성 분석 텍스트 생성
   */
  static generateFinancialAnalysis(
    metrics: CalculatedMetrics,
    _rawData: SupplierRawData
  ): string {
    let score = 0;
    const points: string[] = [];

    // 유동비율 평가
    if (metrics.liquidityRatio !== null) {
      if (metrics.liquidityRatio >= FINANCIAL_THRESHOLDS.liquidityRatio.excellent) {
        score += 2;
        points.push(`유동비율 ${metrics.liquidityRatio.toFixed(1)}%로 단기 유동성이 우수`);
      } else if (metrics.liquidityRatio >= FINANCIAL_THRESHOLDS.liquidityRatio.good) {
        score += 1;
        points.push(`유동비율 ${metrics.liquidityRatio.toFixed(1)}%로 단기 유동성이 양호`);
      } else {
        points.push(`유동비율 ${metrics.liquidityRatio.toFixed(1)}%로 단기 유동성 개선 필요`);
      }
    }

    // 부채비율 평가
    if (metrics.debtToEquityRatio !== null) {
      if (metrics.debtToEquityRatio < FINANCIAL_THRESHOLDS.debtToEquityRatio.excellent) {
        score += 2;
        points.push(`부채비율 ${metrics.debtToEquityRatio.toFixed(1)}%로 자본 건전성이 매우 우수`);
      } else if (metrics.debtToEquityRatio < FINANCIAL_THRESHOLDS.debtToEquityRatio.good) {
        score += 1;
        points.push(`부채비율 ${metrics.debtToEquityRatio.toFixed(1)}%로 자본 건전성이 양호`);
      } else {
        points.push(`부채비율 ${metrics.debtToEquityRatio.toFixed(1)}%로 부채 관리 주의 필요`);
      }
    }

    // 순이익률 평가
    if (metrics.netProfitMargin !== null) {
      if (metrics.netProfitMargin >= FINANCIAL_THRESHOLDS.netProfitMargin.excellent) {
        score += 2;
        points.push(`순이익률 ${metrics.netProfitMargin.toFixed(1)}%로 수익성이 뛰어남`);
      } else if (metrics.netProfitMargin >= FINANCIAL_THRESHOLDS.netProfitMargin.good) {
        score += 1;
        points.push(`순이익률 ${metrics.netProfitMargin.toFixed(1)}%로 수익성이 양호`);
      } else if (metrics.netProfitMargin < 0) {
        points.push(`순이익률 ${metrics.netProfitMargin.toFixed(1)}%로 적자 상태이며 수익성 개선 시급`);
      } else {
        points.push(`순이익률 ${metrics.netProfitMargin.toFixed(1)}%로 수익성 개선 필요`);
      }
    }

    // 매출 증감률 평가
    if (metrics.salesGrowthRate !== null) {
      if (metrics.salesGrowthRate >= FINANCIAL_THRESHOLDS.salesGrowthRate.excellent) {
        score += 2;
        points.push(`매출 증가율 ${metrics.salesGrowthRate.toFixed(1)}%로 성장세가 매우 강함`);
      } else if (metrics.salesGrowthRate >= FINANCIAL_THRESHOLDS.salesGrowthRate.good) {
        score += 1;
        points.push(`매출 증가율 ${metrics.salesGrowthRate.toFixed(1)}%로 안정적 성장세 유지`);
      } else {
        points.push(`매출 증가율 ${metrics.salesGrowthRate.toFixed(1)}%로 성장세 둔화 우려`);
      }
    }

    // 종합 평가
    let summary = '';
    if (score >= 7) {
      summary = '매우 안정적인 재무 구조를 갖추고 있습니다. ';
    } else if (score >= 5) {
      summary = '양호한 재무 상태를 유지하고 있습니다. ';
    } else if (score >= 3) {
      summary = '재무 관리에 주의가 필요한 상태입니다. ';
    } else {
      summary = '재무 건전성에 우려가 있어 면밀한 검토가 필요합니다. ';
    }

    return summary + points.join('하며, ') + '합니다.';
  }

  /**
   * 운영/기술 역량 분석 텍스트 생성
   */
  static generateOperationalAnalysis(
    rawData: SupplierRawData,
    allSuppliers: SupplierRawData[]
  ): string {
    const points: string[] = [];
    let score = 0;

    // 안전 점수 백분위수 계산
    const safetyScores = allSuppliers
      .map(s => s.safety_questionnaire_score)
      .filter(s => s > 0)
      .sort((a, b) => b - a);
    
    const percentile = safetyScores.length > 0
      ? (safetyScores.indexOf(rawData.safety_questionnaire_score) / safetyScores.length) * 100
      : 50;

    if (percentile <= 25) {
      score += 2;
      points.push(`안전 관리 체계가 매우 우수합니다(상위 ${percentile.toFixed(0)}%)`);
    } else if (percentile <= 50) {
      score += 1;
      points.push(`안전 관리 체계가 양호합니다(상위 ${percentile.toFixed(0)}%)`);
    } else if (percentile <= 75) {
      points.push(`안전 관리 체계가 평균 수준입니다(상위 ${percentile.toFixed(0)}%)`);
    } else {
      points.push(`안전 관리 체계 개선이 필요합니다(상위 ${percentile.toFixed(0)}%)`);
    }

    // 인력 구성 평가
    const totalEmployees = rawData.hq_employees + rawData.bct_office_employees;
    
    if (totalEmployees > 100) {
      score += 2;
      points.push(`총 인력 ${totalEmployees}명으로 충분한 인력을 보유하고 있음`);
    } else if (totalEmployees > 50) {
      score += 1;
      points.push(`총 인력 ${totalEmployees}명으로 적정 규모의 인력을 보유함`);
    } else if (totalEmployees > 0) {
      points.push(`총 인력 ${totalEmployees}명으로 소규모 조직임`);
    }

    return points.join('. ') + '.';
  }

  /**
   * 종합 의견 및 거래 전략 생성 (평가 점수 반영)
   */
  static generateOverallRecommendation(
    _financialAnalysis: string,
    _operationalAnalysis: string,
    metrics: CalculatedMetrics,
    rawData: SupplierRawData,
    evaluationScore?: number // 최종 변환점수 (M)
  ): { text: string; riskLevel: RiskLevel } {
    let riskLevel: RiskLevel;
    let recommendation: string;

    // 평가 점수가 있으면 우선 적용
    if (evaluationScore !== undefined && evaluationScore > 0) {
      if (evaluationScore >= 90) {
        // 우수 협력사
        riskLevel = 'LOW';
        recommendation = `최종 변환점수 ${evaluationScore.toFixed(2)}점으로 우수 협력사로 분류되었습니다. 전략적 협력 파트너로 선정하여 장기 공급 계약(3년 이상) 체결을 적극 권장합니다. 안정적인 재무 구조와 우수한 운영 역량을 바탕으로 핵심 공급업체로 육성하는 것이 적합합니다. 정기적인 협력 관계 강화 미팅과 기술 교류를 통해 상호 발전을 도모하며, 우선 발주 및 물량 보장을 통한 Win-Win 전략을 추진할 것을 권장합니다.`;
      } else if (evaluationScore >= 80) {
        // 준수한 협력사
        riskLevel = 'LOW';
        recommendation = `최종 변환점수 ${evaluationScore.toFixed(2)}점으로 준수한 협력사로 분류되었습니다. 중장기 공급 계약(1-2년) 체결이 적합하며, 안정적인 거래 관계를 유지할 수 있습니다. 분기별 성과 평가를 통해 지속적인 품질 향상을 유도하고, 우수 협력사로의 발전 가능성을 모니터링할 것을 권장합니다. 성과 기반 인센티브 제도를 도입하여 협력 관계를 강화하는 것이 효과적입니다.`;
      } else if (evaluationScore >= 60) {
        // 승인 공급업체 (다소 미흡)
        riskLevel = 'MEDIUM';
        recommendation = `최종 변환점수 ${evaluationScore.toFixed(2)}점으로 승인 공급업체로 분류되었으나 다소 미흡한 부분이 있습니다. 단기 계약(6개월-1년) 또는 건별 계약이 적합하며, 개선 목표 설정 및 이행 모니터링이 필요합니다. 월별 성과 점검을 통해 개선 사항을 추적하고, 목표 달성 시 계약 기간 연장을 검토하는 조건부 계약을 권장합니다. 대체 공급업체 확보를 병행하여 공급 리스크를 관리해야 합니다.`;
      } else {
        // 제외 대상
        riskLevel = 'HIGH';
        recommendation = `최종 변환점수 ${evaluationScore.toFixed(2)}점으로 공급업체 자격조건 충족 시까지 제외 대상입니다. 현재 상태로는 거래가 부적절하며, 구체적인 개선 계획 수립 및 이행이 필수적입니다. 개선 완료 후 재평가를 통해 협력 가능 여부를 판단해야 하며, 그 전까지는 신규 발주를 중단하고 기존 계약도 조기 종료를 검토해야 합니다. 즉시 대체 공급업체를 확보할 것을 강력히 권장합니다.`;
      }
    } else {
      // 평가 점수가 없으면 기존 로직 사용
      // 재무 점수 계산
      let financialScore = 0;
      if (metrics.liquidityRatio && metrics.liquidityRatio >= 200) financialScore += 2;
      else if (metrics.liquidityRatio && metrics.liquidityRatio >= 150) financialScore += 1;
      
      if (metrics.debtToEquityRatio && metrics.debtToEquityRatio < 100) financialScore += 2;
      else if (metrics.debtToEquityRatio && metrics.debtToEquityRatio < 150) financialScore += 1;
      
      if (metrics.netProfitMargin && metrics.netProfitMargin >= 10) financialScore += 2;
      else if (metrics.netProfitMargin && metrics.netProfitMargin >= 5) financialScore += 1;
      
      if (metrics.salesGrowthRate && metrics.salesGrowthRate >= 10) financialScore += 2;
      else if (metrics.salesGrowthRate && metrics.salesGrowthRate >= 0) financialScore += 1;

      // 운영 점수는 간단히 안전 등급으로 평가
      let operationalScore = 0;
      switch (rawData.safety_questionnaire_grade) {
        case 'A': operationalScore = 6; break;
        case 'B': operationalScore = 4; break;
        case 'C': operationalScore = 2; break;
        case 'D': operationalScore = 0; break;
        default: operationalScore = 3;
      }

      const totalScore = financialScore + operationalScore;

      if (totalScore >= 11) {
        riskLevel = 'LOW';
        recommendation = '전략적 협력 파트너로 선정하여 장기 공급 계약 및 공동 기술 개발을 고려할 수 있습니다. 안정적인 재무 구조와 우수한 운영 역량을 바탕으로 핵심 공급업체로 육성하는 것이 적합합니다. 정기적인 협력 관계 강화 미팅과 기술 교류를 통해 상호 발전을 도모할 것을 권장합니다.';
      } else if (totalScore >= 7) {
        riskLevel = 'MEDIUM';
        if (financialScore > operationalScore) {
          recommendation = '재무 건전성은 양호하나 운영 역량 개선이 필요합니다. 단계적 거래 확대를 진행하되, 안전 관리 및 품질 시스템 개선 계획을 요구하고 정기적으로 모니터링할 것을 권장합니다. 6개월 단위로 개선 현황을 점검하며 거래 규모를 조정하는 것이 적절합니다.';
        } else {
          recommendation = '운영 역량은 우수하나 재무 안정성 개선이 필요합니다. 거래 금액을 제한하고 재무 개선 계획을 요구하며, 분기별 재무제표 제출을 통해 재무 상태를 모니터링할 것을 권장합니다. 선급금 비율을 낮추고 후불 결제 조건을 강화하는 것이 바람직합니다.';
        }
      } else {
        riskLevel = 'HIGH';
        recommendation = '단기 거래에 한정하고 거래 금액을 엄격히 제한해야 합니다. 선급금 지급을 최소화하고, 재무 및 운영 개선 계획을 필수적으로 요구해야 합니다. 매월 재무 상태와 안전 관리 현황을 점검하며, 개선이 확인되기 전까지는 신규 발주를 보류하는 것이 적절합니다. 대체 공급업체 확보를 병행할 것을 강력히 권장합니다.';
      }
    }

    return { text: recommendation, riskLevel };
  }

  /**
   * 완전한 분석 텍스트 생성
   */
  static generateCompleteAnalysis(
    supplier: SupplierRawData,
    metrics: CalculatedMetrics,
    allSuppliers: SupplierRawData[]
  ): AnalysisTexts {
    const financialAnalysis = this.generateFinancialAnalysis(metrics, supplier);
    const operationalAnalysis = this.generateOperationalAnalysis(supplier, allSuppliers);
    const { text: overallRecommendation, riskLevel } = this.generateOverallRecommendation(
      financialAnalysis,
      operationalAnalysis,
      metrics,
      supplier
    );

    return {
      financialAnalysis,
      operationalAnalysis,
      overallRecommendation,
      riskLevel,
    };
  }
}
