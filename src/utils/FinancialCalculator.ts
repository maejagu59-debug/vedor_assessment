import { SupplierRawData, CalculatedMetrics } from '../types';

export class FinancialCalculator {
  /**
   * 유동비율 계산: (유동자산 / 유동부채) * 100
   */
  static calculateLiquidityRatio(
    currentAssets: number,
    currentLiabilities: number
  ): number | null {
    if (currentLiabilities <= 0 || currentAssets < 0) {
      return null;
    }
    return (currentAssets / currentLiabilities) * 100;
  }

  /**
   * 부채비율 계산: (총부채 / 자기자본) * 100
   */
  static calculateDebtToEquityRatio(
    totalLiabilities: number,
    equity: number
  ): number | null {
    if (equity <= 0 || totalLiabilities < 0) {
      return null;
    }
    return (totalLiabilities / equity) * 100;
  }

  /**
   * 순이익률 계산: (순이익 / 당기매출액) * 100
   */
  static calculateNetProfitMargin(
    netIncome: number,
    currentYearSales: number
  ): number | null {
    if (currentYearSales <= 0) {
      return null;
    }
    return (netIncome / currentYearSales) * 100;
  }

  /**
   * 매출 증감률 계산: ((당기매출 - 전기매출) / 전기매출) * 100
   */
  static calculateSalesGrowthRate(
    currentYearSales: number,
    previousYearSales: number
  ): number | null {
    if (previousYearSales <= 0) {
      return null;
    }
    return ((currentYearSales - previousYearSales) / previousYearSales) * 100;
  }

  /**
   * 모든 재무 지표 일괄 계산
   */
  static calculateAllMetrics(data: SupplierRawData): CalculatedMetrics {
    return {
      liquidityRatio: this.calculateLiquidityRatio(
        data.current_assets,
        data.current_liabilities
      ),
      debtToEquityRatio: this.calculateDebtToEquityRatio(
        data.total_liabilities,
        data.equity
      ),
      netProfitMargin: this.calculateNetProfitMargin(
        data.net_income,
        data.current_year_sales
      ),
      salesGrowthRate: this.calculateSalesGrowthRate(
        data.current_year_sales,
        data.previous_year_sales
      ),
    };
  }

  /**
   * 재무 지표를 포맷팅된 문자열로 변환 (천단위 쉼표 포함)
   */
  static formatMetric(value: number | null, suffix: string = '%'): string {
    if (value === null) {
      return 'N/A';
    }
    // 천단위 쉼표 추가
    const formattedValue = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedValue}${suffix}`;
  }

  /**
   * 재무 지표의 건전성 레벨 평가
   */
  static evaluateMetricLevel(
    metricName: 'liquidityRatio' | 'debtToEquityRatio' | 'netProfitMargin' | 'salesGrowthRate',
    value: number | null
  ): 'excellent' | 'good' | 'caution' | 'unavailable' {
    if (value === null) {
      return 'unavailable';
    }

    const thresholds = {
      liquidityRatio: { excellent: 200, good: 150 },
      debtToEquityRatio: { excellent: 100, good: 150 },
      netProfitMargin: { excellent: 10, good: 5 },
      salesGrowthRate: { excellent: 10, good: 0 },
    };

    const threshold = thresholds[metricName];

    switch (metricName) {
      case 'liquidityRatio':
      case 'netProfitMargin':
      case 'salesGrowthRate':
        if (value >= threshold.excellent) return 'excellent';
        if (value >= threshold.good) return 'good';
        return 'caution';
      
      case 'debtToEquityRatio':
        if (value < threshold.excellent) return 'excellent';
        if (value < threshold.good) return 'good';
        return 'caution';
      
      default:
        return 'caution';
    }
  }
}
