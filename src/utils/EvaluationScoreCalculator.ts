import { EvaluationData } from '../types';
import { TransactionData } from './TransactionParser';

export interface CategoryStatistics {
  mean: number; // μ (평균)
  stdDev: number; // σ (표준편차)
  weight: number; // wi (가중치)
}

export interface ScoreCalculationParams {
  rawScore: number; // Xi (원점수)
  categoryStats: CategoryStatistics;
  transactionAmount: number; // Vi (거래금액)
  transactionCount: number; // Ti (거래횟수)
  k: number; // 상수
  c: number; // 조정계수
}

export class EvaluationScoreCalculator {
  // 카테고리별 가중치 설정 (정확한 비율)
  private static readonly CATEGORY_WEIGHTS: Record<string, number> = {
    'A': 0.25, // 25%
    'B': 0.05, // 5%
    'C': 0.15, // 15%
    'D': 0.03, // 3%
    'E': 0.03, // 3%
    'F': 0.01, // 미정의
    'G': 0.01, // 미정의
    'H': 0.01, // 1%
  };

  // 기본 상수 설정
  private static readonly STANDARD_MULTIPLIER = 20; // 표준화 승수
  private static readonly TRANSACTION_COEFFICIENT = 0.001; // 거래 데이터 계수

  /**
   * 카테고리별 통계 계산
   */
  static calculateCategoryStatistics(
    evaluations: EvaluationData[],
    category: string
  ): CategoryStatistics {
    const categoryEvals = evaluations.filter(e => e.supplier_group === category);
    
    if (categoryEvals.length === 0) {
      return {
        mean: 0,
        stdDev: 1,
        weight: this.CATEGORY_WEIGHTS[category] || 1.0,
      };
    }

    // 평균 계산
    const scores = categoryEvals.map(e => e.final_score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

    // 표준편차 계산
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance) || 1; // 0으로 나누기 방지

    return {
      mean,
      stdDev,
      weight: this.CATEGORY_WEIGHTS[category] || 1.0,
    };
  }

  /**
   * 표준변환 증감점수 계산
   * L = ((F-G)/H*I*20)+(J*K*0.001)
   * F: 원점수, G: 평균점수, H: 표준편차, I: 카테고리 가중치
   * J: 거래금액(억원), K: 거래횟수(회)
   */
  static calculateAdjustmentScore(params: ScoreCalculationParams): number {
    const {
      rawScore,
      categoryStats,
      transactionAmount,
      transactionCount,
    } = params;

    // 표준화 부분: ((F-G)/H*I*20)
    const standardizedPart = 
      ((rawScore - categoryStats.mean) / categoryStats.stdDev) * 
      categoryStats.weight * 
      this.STANDARD_MULTIPLIER;

    // 거래 데이터 부분: (J*K*0.001)
    // 거래금액은 억원 단위로 입력됨
    const transactionPart = transactionAmount * transactionCount * this.TRANSACTION_COEFFICIENT;

    // 표준변환 증감점수
    const adjustmentScore = standardizedPart + transactionPart;

    return adjustmentScore;
  }

  /**
   * 최종 변환점수 계산
   * M = F + L (단, 최대 100점)
   * F: 원점수, L: 표준변환 증감점수
   */
  static calculateFinalConvertedScore(
    rawScore: number,
    adjustmentScore: number
  ): number {
    const finalScore = rawScore + adjustmentScore;
    // 최종 변환점수는 100점을 초과할 수 없음
    return Math.min(finalScore, 100);
  }

  /**
   * 평가 데이터에 표준화 점수 적용
   */
  static applyStandardizedScoring(
    evaluation: EvaluationData,
    allEvaluations: EvaluationData[],
    transactionAmountInBillion: number = 0, // 억원 단위
    transactionCount: number = 0
  ): {
    rawScore: number; // F: 원점수
    categoryMean: number; // G: 카테고리 평균
    categoryStdDev: number; // H: 카테고리 표준편차
    categoryWeight: number; // I: 카테고리 가중치
    transactionAmount: number; // J: 거래금액(억원)
    transactionCount: number; // K: 거래횟수(회)
    adjustmentScore: number; // L: 표준변환 증감점수
    finalConvertedScore: number; // M: 최종 변환점수
    grade: string; // 등급
    gradeDescription: string; // 등급 설명
  } {
    const categoryStats = this.calculateCategoryStatistics(
      allEvaluations,
      evaluation.supplier_group
    );

    const adjustmentScore = this.calculateAdjustmentScore({
      rawScore: evaluation.final_score,
      categoryStats,
      transactionAmount: transactionAmountInBillion,
      transactionCount,
      k: 0,
      c: 0,
    });

    const finalConvertedScore = this.calculateFinalConvertedScore(
      evaluation.final_score,
      adjustmentScore
    );

    const { grade, description } = this.determineGrade(finalConvertedScore);

    return {
      rawScore: evaluation.final_score,
      categoryMean: categoryStats.mean,
      categoryStdDev: categoryStats.stdDev,
      categoryWeight: categoryStats.weight,
      transactionAmount: transactionAmountInBillion,
      transactionCount,
      adjustmentScore,
      finalConvertedScore,
      grade,
      gradeDescription: description,
    };
  }

  /**
   * 최종 변환점수 기반 등급 결정
   */
  static determineGrade(finalScore: number): { grade: string; description: string } {
    if (finalScore >= 90) {
      return {
        grade: '우수 협력사',
        description: '최종 변환점수 90점 이상으로 우수한 협력사입니다.',
      };
    } else if (finalScore >= 80) {
      return {
        grade: '준수한 협력사',
        description: '최종 변환점수 80점 이상으로 준수한 협력사입니다.',
      };
    } else if (finalScore >= 60) {
      return {
        grade: '승인 공급업체',
        description: '최종 변환점수 60점 이상으로 다소 미흡한 부분이 있으나 승인된 공급업체입니다.',
      };
    } else {
      return {
        grade: '제외 대상',
        description: '최종 변환점수 60점 미만으로 공급업체 자격조건 충족 시까지 제외 대상입니다.',
      };
    }
  }

  /**
   * 거래 데이터 기반 공급업체 중요도 계산
   */
  static calculateSupplierImportance(transaction: TransactionData): {
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
  } {
    const monthlyAmount = transaction.transaction_amount / (transaction.months || 1);
    const monthlyCount = transaction.transaction_count / (transaction.months || 1);

    // 월평균 거래금액 기준 (단위: 만원)
    const amountInManWon = monthlyAmount / 10000;

    if (amountInManWon >= 5000 || monthlyCount >= 50) {
      return {
        level: 'CRITICAL',
        description: '매우 높은 거래 비중으로 터미널 운영에 필수적인 핵심 공급업체',
      };
    } else if (amountInManWon >= 1000 || monthlyCount >= 20) {
      return {
        level: 'HIGH',
        description: '높은 거래 비중으로 터미널 운영에 중요한 주요 공급업체',
      };
    } else if (amountInManWon >= 100 || monthlyCount >= 5) {
      return {
        level: 'MEDIUM',
        description: '중간 수준의 거래 비중을 가진 일반 공급업체',
      };
    } else {
      return {
        level: 'LOW',
        description: '낮은 거래 비중을 가진 소규모 공급업체',
      };
    }
  }
}
