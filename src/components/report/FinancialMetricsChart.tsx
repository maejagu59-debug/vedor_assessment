import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CalculatedMetrics } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FinancialMetricsChartProps {
  metrics: CalculatedMetrics;
}

const FinancialMetricsChart: React.FC<FinancialMetricsChartProps> = ({ metrics }) => {
  // 각 지표의 레벨 평가
  const evaluateLevel = (value: number | null, metricType: string): number => {
    if (value === null) return 0;
    
    switch (metricType) {
      case 'liquidityRatio':
        if (value >= 200) return 4;
        if (value >= 150) return 3;
        if (value >= 100) return 2;
        return 1;
      case 'debtToEquityRatio':
        if (value < 100) return 4;
        if (value < 150) return 3;
        if (value < 200) return 2;
        return 1;
      case 'netProfitMargin':
      case 'salesGrowthRate':
        if (value >= 10) return 4;
        if (value >= 5) return 3;
        if (value >= 0) return 2;
        return 1;
      default:
        return 2;
    }
  };

  // 각 지표의 레벨 계산
  const levels = [
    { type: 'liquidityRatio', level: evaluateLevel(metrics.liquidityRatio, 'liquidityRatio'), value: metrics.liquidityRatio },
    { type: 'debtToEquityRatio', level: evaluateLevel(metrics.debtToEquityRatio, 'debtToEquityRatio'), value: metrics.debtToEquityRatio },
    { type: 'netProfitMargin', level: evaluateLevel(metrics.netProfitMargin, 'netProfitMargin'), value: metrics.netProfitMargin },
    { type: 'salesGrowthRate', level: evaluateLevel(metrics.salesGrowthRate, 'salesGrowthRate'), value: metrics.salesGrowthRate },
  ];

  // 유효한 지표만 필터링
  const validLevels = levels.filter(l => l.value !== null);
  
  // 가장 우수한 지표와 가장 미흡한 지표 찾기
  let bestIndex = -1;
  let worstIndex = -1;
  
  if (validLevels.length > 0) {
    const maxLevel = Math.max(...validLevels.map(l => l.level));
    const minLevel = Math.min(...validLevels.map(l => l.level));
    
    bestIndex = levels.findIndex(l => l.level === maxLevel && l.value !== null);
    worstIndex = levels.findIndex(l => l.level === minLevel && l.value !== null);
  }

  const getColor = (index: number, value: number | null) => {
    if (value === null) return '#d1d5db';
    if (index === bestIndex) return '#0085FF';
    if (index === worstIndex) return '#F76785';
    return '#9ca3af';
  };

  const chartData = {
    labels: ['유동비율', '부채비율', '순이익률', '매출 증감률'],
    datasets: [
      {
        label: '재무 지표 (%)',
        data: [
          metrics.liquidityRatio ?? 0,
          metrics.debtToEquityRatio ?? 0,
          metrics.netProfitMargin ?? 0,
          metrics.salesGrowthRate ?? 0,
        ],
        backgroundColor: [
          getColor(0, metrics.liquidityRatio),
          getColor(1, metrics.debtToEquityRatio),
          getColor(2, metrics.netProfitMargin),
          getColor(3, metrics.salesGrowthRate),
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '재무 지표 시각화',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            return value !== null ? `${value.toFixed(2)}%` : 'N/A';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default FinancialMetricsChart;
