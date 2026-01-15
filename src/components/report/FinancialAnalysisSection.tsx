import React from 'react';
import { SupplierReport } from '../../types';
import { FinancialCalculator } from '../../utils/FinancialCalculator';
import { useApp } from '../../contexts/AppContext';
import FinancialMetricsChart from './FinancialMetricsChart';
import EditableAnalysis from './EditableAnalysis';

interface FinancialAnalysisSectionProps {
  supplier: SupplierReport;
}

const FinancialAnalysisSection: React.FC<FinancialAnalysisSectionProps> = ({ supplier }) => {
  const { metrics, analysis, rawData } = supplier;
  const { isAdmin, updateSupplierAnalysis } = useApp();

  const handleSaveAnalysis = (newContent: string) => {
    updateSupplierAnalysis(rawData.id, { financialAnalysis: newContent });
  };

  const metricsData = [
    {
      name: '유동비율',
      value: metrics.liquidityRatio,
      level: FinancialCalculator.evaluateMetricLevel('liquidityRatio', metrics.liquidityRatio),
      description: '단기 유동성 지표 (유동자산/유동부채)',
    },
    {
      name: '부채비율',
      value: metrics.debtToEquityRatio,
      level: FinancialCalculator.evaluateMetricLevel('debtToEquityRatio', metrics.debtToEquityRatio),
      description: '자본 건전성 지표 (총부채/자기자본)',
    },
    {
      name: '순이익률',
      value: metrics.netProfitMargin,
      level: FinancialCalculator.evaluateMetricLevel('netProfitMargin', metrics.netProfitMargin),
      description: '수익성 지표 (순이익/매출액)',
    },
    {
      name: '매출 증감률',
      value: metrics.salesGrowthRate,
      level: FinancialCalculator.evaluateMetricLevel('salesGrowthRate', metrics.salesGrowthRate),
      description: '성장성 지표 (당기매출-전기매출)/전기매출',
    },
  ];

  const getLevelText = (level: string) => {
    switch (level) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'caution': return '주의';
      case 'unavailable': return 'N/A';
      default: return '-';
    }
  };

  // 가장 우수한 지표와 가장 미흡한 지표 찾기
  const levelPriority = { 'excellent': 4, 'good': 3, 'average': 2, 'caution': 1, 'unavailable': 0 };
  const validMetrics = metricsData.filter(m => m.level !== 'unavailable');
  
  let bestMetricIndex = -1;
  let worstMetricIndex = -1;
  
  if (validMetrics.length > 0) {
    bestMetricIndex = metricsData.findIndex(m => 
      m === validMetrics.reduce((best, current) => 
        levelPriority[current.level] > levelPriority[best.level] ? current : best
      )
    );
    
    worstMetricIndex = metricsData.findIndex(m => 
      m === validMetrics.reduce((worst, current) => 
        levelPriority[current.level] < levelPriority[worst.level] ? current : worst
      )
    );
  }

  const getMetricBorderColor = (index: number, level: string) => {
    if (level === 'unavailable') return '#d1d5db';
    if (index === bestMetricIndex) return '#0085FF';
    if (index === worstMetricIndex) return '#F76785';
    return '#d1d5db';
  };

  const getMetricTextColor = (index: number, level: string) => {
    if (level === 'unavailable') return '#9ca3af';
    if (index === bestMetricIndex) return '#0085FF';
    if (index === worstMetricIndex) return '#F76785';
    return '#111827';
  };

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <h3 className="section-title">재무 건전성 분석</h3>
      
      {/* 지표 테이블 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {metricsData.map((metric, index) => (
          <div
            key={index}
            className="rounded-xl p-4 bg-gray-50"
            style={{ border: `2px solid ${getMetricBorderColor(index, metric.level)}` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700">{metric.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
              <span
                className="ml-2 px-2 py-1 text-xs font-semibold rounded"
                style={{ color: getMetricTextColor(index, metric.level) }}
              >
                {getLevelText(metric.level)}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold" style={{ color: getMetricTextColor(index, metric.level) }}>
              {FinancialCalculator.formatMetric(metric.value)}
            </div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="mb-6">
        <FinancialMetricsChart metrics={metrics} />
      </div>

      {/* 전문가 코멘트 */}
      <EditableAnalysis
        title="면밀한 평가 데이터 분석"
        content={analysis.financialAnalysis}
        onSave={handleSaveAnalysis}
        isAdmin={isAdmin}
        bgColor="bg-gray-50"
        borderColor="border-gray-400"
        iconColor="text-gray-900"
        icon={
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        }
      />
    </div>
  );
};

export default FinancialAnalysisSection;
