import { EvaluationData } from '../types';

export interface BenchmarkMetric {
  name: string;
  supplierScore: number;
  groupAverage: number;
  groupMax: number;
  groupMin: number;
  percentile: number;
  rank: number;
  totalCount: number;
  status: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}

export interface BenchmarkAnalysis {
  metrics: BenchmarkMetric[];
  overallPosition: string;
  strengths: string[];
  improvements: string[];
  insight: string;
}

export class BenchmarkingAnalyzer {
  /**
   * 벤치마킹 분석 생성
   */
  static analyzeBenchmark(
    evaluation: EvaluationData,
    allEvaluations: EvaluationData[]
  ): BenchmarkAnalysis {
    console.log('=== BenchmarkingAnalyzer 디버깅 ===');
    console.log('현재 업체:', evaluation.supplier_name);
    console.log('supplier_group:', evaluation.supplier_group);
    console.log('detail_group:', evaluation.detail_group);
    console.log('전체 평가 데이터 수:', allEvaluations.length);
    console.log('E 그룹 업체들의 detail_group:', 
      allEvaluations
        .filter(e => e.supplier_group === 'E')
        .map(e => ({ name: e.supplier_name, detail_group: e.detail_group }))
    );
    
    // E 그룹이고 세부 그룹이 있는 경우에만 세부 그룹으로 필터링
    const groupEvaluations = allEvaluations.filter(e => {
      if (evaluation.supplier_group === 'E' && evaluation.detail_group) {
        // E 그룹 + 세부 그룹 있음: 같은 세부 그룹끼리만 비교
        return e.detail_group === evaluation.detail_group;
      } else {
        // 그 외: 같은 원본 그룹끼리 비교
        return e.supplier_group === evaluation.supplier_group;
      }
    });
    
    console.log('필터링된 업체 수:', groupEvaluations.length);
    console.log('필터링된 업체들:', groupEvaluations.map(e => e.supplier_name));

    // 주요 지표 분석
    const metrics: BenchmarkMetric[] = [
      this.analyzeMetric('최종 점수', evaluation.final_score, groupEvaluations.map(e => e.final_score)),
      this.analyzeMetric('안정성', evaluation.stability_score, groupEvaluations.map(e => e.stability_score)),
      this.analyzeMetric('지속가능성', evaluation.sustainability_score, groupEvaluations.map(e => e.sustainability_score)),
    ];

    // 세부 항목 분석 (sustainability_details)
    if (evaluation.sustainability_details?.items) {
      const items = evaluation.sustainability_details.items;
      const itemNames: Record<string, string> = {
        performanceAmount: '실적금액',
        performanceCount: '실적횟수',
        contractSupport: '계약지원',
        qualityMgmt: '품질관리',
        deliveryMgmt: '납기관리',
        safetyService: '안전서비스',
        serviceQuality: '서비스품질',
      };

      Object.entries(items).forEach(([key, value]) => {
        if (itemNames[key]) {
          const scores = groupEvaluations
            .map(e => e.sustainability_details?.items?.[key])
            .filter(s => s !== undefined)
            .map(s => Number(s));
          
          if (scores.length > 0) {
            metrics.push(this.analyzeMetric(itemNames[key], Number(value), scores));
          }
        }
      });
    }

    // 강점과 개선점 도출
    const strengths = metrics
      .filter(m => m.status === 'excellent' || m.status === 'good')
      .map(m => m.name)
      .slice(0, 3);

    const improvements = metrics
      .filter(m => m.status === 'below_average' || m.status === 'poor')
      .map(m => m.name)
      .slice(0, 3);

    // 전체 포지션 분석 (순위 기반)
    const overallPosition = this.determineOverallPosition(evaluation, groupEvaluations);

    // 인사이트 생성
    const insight = this.generateInsight(evaluation, metrics, groupEvaluations);

    return {
      metrics,
      overallPosition,
      strengths,
      improvements,
      insight,
    };
  }

  /**
   * 개별 지표 분석
   */
  private static analyzeMetric(
    name: string,
    supplierScore: number,
    groupScores: number[]
  ): BenchmarkMetric {
    const groupAverage = groupScores.reduce((a, b) => a + b, 0) / groupScores.length;
    const groupMax = Math.max(...groupScores);
    const groupMin = Math.min(...groupScores);

    // 평균 대비 차이 계산
    const difference = supplierScore - groupAverage;
    const percentageDiff = groupAverage !== 0 ? (difference / groupAverage) * 100 : 0;

    // 순위 계산 (높은 점수가 좋은 순위)
    const sortedScores = [...groupScores].sort((a, b) => b - a);
    const rank = sortedScores.findIndex(score => score <= supplierScore) + 1;
    const totalCount = groupScores.length;

    // 상태 결정 (평균 대비 퍼센트 기준)
    let status: BenchmarkMetric['status'];
    if (percentageDiff >= 30) status = 'excellent';      // +30% 이상: 우수
    else if (percentageDiff >= 10) status = 'good';      // +10% 이상: 양호
    else if (percentageDiff >= -10) status = 'average';  // ±10% 이내: 보통
    else if (percentageDiff >= -30) status = 'below_average'; // -10% ~ -30%: 미흡
    else status = 'poor';                                // -30% 미만: 부진

    // 백분위를 평균 대비 차이로 표시 (기존 백분위 대신)
    const percentile = Math.abs(percentageDiff);

    return {
      name,
      supplierScore,
      groupAverage,
      groupMax,
      groupMin,
      percentile, // 이제 평균 대비 차이 퍼센트를 저장
      rank,
      totalCount,
      status,
    };
  }

  /**
   * 전체 포지션 결정 (순위 기반)
   */
  private static determineOverallPosition(
    evaluation: EvaluationData,
    groupEvaluations: EvaluationData[]
  ): string {
    // 최종 변환점수 기준으로 순위 계산
    const sortedScores = groupEvaluations
      .map(e => e.final_score)
      .sort((a, b) => b - a); // 내림차순 정렬
    
    const rank = sortedScores.findIndex(score => score === evaluation.final_score) + 1;
    
    return `카테고리 내 ${rank}위`;
  }

  /**
   * 인사이트 생성
   */
  private static generateInsight(
    evaluation: EvaluationData,
    metrics: BenchmarkMetric[],
    groupEvaluations: EvaluationData[]
  ): string {
    const finalScoreMetric = metrics.find(m => m.name === '최종 점수');
    if (!finalScoreMetric) return '';

    const diff = finalScoreMetric.supplierScore - finalScoreMetric.groupAverage;
    
    // 최종 변환점수 기준으로 순위 계산
    const sortedScores = groupEvaluations
      .map(e => e.final_score)
      .sort((a, b) => b - a); // 내림차순 정렬
    
    const rank = sortedScores.findIndex(score => score === evaluation.final_score) + 1;
    const groupSize = groupEvaluations.length;

    let insight = `${evaluation.supplier_group} 카테고리 ${groupSize}개 업체 중 ${rank}위입니다. `;

    // 점수 차이 분석
    if (Math.abs(diff) < 3) {
      insight += '카테고리 평균과 유사한 수준의 평가를 받았습니다. ';
    } else if (diff >= 10) {
      insight += `카테고리 평균보다 ${diff.toFixed(1)}점 높아 매우 우수한 평가를 받았습니다. `;
    } else if (diff >= 5) {
      insight += `카테고리 평균보다 ${diff.toFixed(1)}점 높아 양호한 평가를 받았습니다. `;
    } else if (diff <= -10) {
      insight += `카테고리 평균보다 ${Math.abs(diff).toFixed(1)}점 낮아 개선이 시급합니다. `;
    } else if (diff < 0) {
      insight += `카테고리 평균보다 ${Math.abs(diff).toFixed(1)}점 낮아 개선이 필요합니다. `;
    }

    // 강점/약점 분석
    const excellentCount = metrics.filter(m => m.status === 'excellent').length;
    const poorCount = metrics.filter(m => m.status === 'poor' || m.status === 'below_average').length;

    if (excellentCount > poorCount) {
      insight += '대부분의 평가 항목에서 카테고리 평균을 상회하는 우수한 성과를 보이고 있습니다.';
    } else if (poorCount > excellentCount) {
      insight += '일부 평가 항목에서 카테고리 평균을 하회하여 집중적인 개선이 필요합니다.';
    } else {
      insight += '평가 항목별로 강점과 약점이 혼재되어 있어 균형적인 개선이 필요합니다.';
    }

    return insight;
  }

  /**
   * 레이더 차트 데이터 생성
   */
  static generateRadarData(
    evaluation: EvaluationData,
    allEvaluations: EvaluationData[]
  ): {
    labels: string[];
    supplierData: number[];
    groupAverageData: number[];
  } {
    const groupEvaluations = allEvaluations.filter(
      e => e.supplier_group === evaluation.supplier_group
    );

    const labels: string[] = [];
    const supplierData: number[] = [];
    const groupAverageData: number[] = [];

    // 주요 지표
    labels.push('최종점수');
    supplierData.push(evaluation.final_score);
    groupAverageData.push(
      groupEvaluations.reduce((sum, e) => sum + e.final_score, 0) / groupEvaluations.length
    );

    labels.push('안정성');
    supplierData.push(evaluation.stability_score * 10); // 10점 만점을 100점 만점으로 환산
    groupAverageData.push(
      (groupEvaluations.reduce((sum, e) => sum + e.stability_score, 0) / groupEvaluations.length) * 10
    );

    labels.push('지속가능성');
    supplierData.push((evaluation.sustainability_score / 90) * 100); // 90점 만점을 100점 만점으로 환산
    groupAverageData.push(
      ((groupEvaluations.reduce((sum, e) => sum + e.sustainability_score, 0) / groupEvaluations.length) / 90) * 100
    );

    // 세부 항목 (상위 5개)
    if (evaluation.sustainability_details?.items) {
      const items = evaluation.sustainability_details.items;
      const itemNames: Record<string, string> = {
        performanceAmount: '실적금액',
        performanceCount: '실적횟수',
        qualityMgmt: '품질관리',
        safetyService: '안전서비스',
        serviceQuality: '서비스품질',
      };

      Object.entries(itemNames).forEach(([key, name]) => {
        if (items[key] !== undefined) {
          labels.push(name);
          supplierData.push((Number(items[key]) / 5) * 100); // 5점 만점을 100점 만점으로 환산
          
          const groupAvg = groupEvaluations
            .map(e => e.sustainability_details?.items?.[key])
            .filter(s => s !== undefined)
            .reduce((sum, s) => sum + Number(s), 0) / groupEvaluations.length;
          
          groupAverageData.push((groupAvg / 5) * 100);
        }
      });
    }

    return {
      labels,
      supplierData,
      groupAverageData,
    };
  }
}
