import React from 'react';
import { SupplierReport } from '../../types';
import { useApp } from '../../contexts/AppContext';
import EditableAnalysis from './EditableAnalysis';

interface OperationalAnalysisSectionProps {
  supplier: SupplierReport;
}

const OperationalAnalysisSection: React.FC<OperationalAnalysisSectionProps> = ({ supplier }) => {
  const { rawData, analysis } = supplier;
  const { isAdmin, updateSupplierAnalysis } = useApp();

  const handleSaveAnalysis = (newContent: string) => {
    updateSupplierAnalysis(rawData.id, { operationalAnalysis: newContent });
  };

  const totalEmployees = rawData.hq_employees + rawData.bct_office_employees;

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-blue-600';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-danger';
  };

  const metrics = [
    {
      label: '안전 설문 점수',
      value: rawData.safety_questionnaire_score,
      max: 100,
      unit: '점',
    },
    {
      label: '총 인력',
      value: totalEmployees,
      max: 200,
      unit: '명',
    },
  ];

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <h3 className="section-title">운영 및 기술 역량 분석</h3>

      {/* 지표 진행률 바 */}
      <div className="space-y-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{metric.label}</span>
              <span className="text-sm font-semibold text-gray-900">
                {metric.value.toFixed(1)}{metric.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getScoreColor(
                  metric.value,
                  metric.max
                )}`}
                style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* 인력 구성 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">인력 구성</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-500">본사 인력</div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {rawData.hq_employees.toLocaleString()}명
            </div>
          </div>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-500">BCT 사무소 인력</div>
            <div className="text-xl font-bold text-blue-600 mt-1">
              {rawData.bct_office_employees.toLocaleString()}명
            </div>
          </div>
        </div>
      </div>

      {/* 전문가 코멘트 */}
      <EditableAnalysis
        title="면밀한 평가 데이터 분석"
        content={analysis.operationalAnalysis}
        onSave={handleSaveAnalysis}
        isAdmin={isAdmin}
        bgColor="bg-gray-50"
        borderColor="border-gray-400"
        iconColor="text-gray-900"
        icon={
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        }
      />
    </div>
  );
};

export default OperationalAnalysisSection;
