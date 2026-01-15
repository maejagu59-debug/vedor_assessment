import React, { useMemo } from 'react';
import { EvaluationData } from '../../types';
import { EvaluationAnalysisGenerator } from '../../utils/EvaluationAnalysisGenerator';

interface OperationalEvaluationSectionProps {
  evaluation: EvaluationData;
  allEvaluations: EvaluationData[];
}

const OperationalEvaluationSection: React.FC<OperationalEvaluationSectionProps> = ({
  evaluation,
  allEvaluations,
}) => {
  const analysis = useMemo(() => {
    return EvaluationAnalysisGenerator.generateAnalysis(evaluation, allEvaluations);
  }, [evaluation, allEvaluations]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">공급업체 평가 결과 분석</h2>

      {/* 카테고리 및 총점 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">평가 카테고리</p>
            <p className="text-lg font-semibold text-gray-900">{analysis.categoryName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">총점</p>
            <p className="text-3xl font-bold text-primary">{analysis.totalScore.toFixed(1)}</p>
            <p className="text-xs text-gray-500">/ 100점</p>
          </div>
        </div>
      </div>

      {/* 요약 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">평가 요약</h3>
        <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* 그룹 비교 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">그룹 내 위치</h3>
        <p className="text-gray-700 leading-relaxed">{analysis.groupComparison}</p>
      </div>

      {/* 강점과 약점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 강점 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            강점 항목
          </h3>
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">만점 항목이 없습니다.</p>
          )}
        </div>

        {/* 약점 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            개선 필요 항목
          </h3>
          {analysis.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">개선이 필요한 항목이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 개선 권고사항 */}
      {analysis.weaknesses.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            개선 권고사항
          </h3>
          <p className="text-gray-700">
            평가 결과 일부 항목에서 낮은 점수를 받았습니다. 
            해당 항목에 대한 개선 계획을 수립하고, 다음 평가 시 개선된 모습을 보여주시기 바랍니다.
            특히 3점 이하 항목은 우선적으로 개선이 필요합니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default OperationalEvaluationSection;
