import React, { useMemo } from 'react';
import { SupplierReport, EvaluationData } from '../../types';

interface EvaluationSummaryBannerProps {
  supplier: SupplierReport;
  allEvaluations: EvaluationData[];
}

const EvaluationSummaryBanner: React.FC<EvaluationSummaryBannerProps> = ({
  supplier,
  allEvaluations,
}) => {
  const { evaluation } = supplier;

  // 카테고리 내 순위 계산
  const categoryRank = useMemo(() => {
    if (!evaluation) return null;
    
    // E 그룹이고 세부 그룹이 있는 경우 세부 그룹으로 필터링
    const categoryEvaluations = allEvaluations.filter(e => {
      if (evaluation.supplier_group === 'E' && evaluation.detail_group) {
        return e.detail_group === evaluation.detail_group;
      } else {
        return e.supplier_group === evaluation.supplier_group;
      }
    });
    
    const sortedScores = categoryEvaluations
      .map(e => e.final_score)
      .sort((a, b) => b - a);
    
    const rank = sortedScores.findIndex(score => score === evaluation.final_score) + 1;
    const total = categoryEvaluations.length;
    
    return { rank, total };
  }, [evaluation, allEvaluations]);

  if (!evaluation) return null;

  // 평가 결과 판정
  const evaluationPass = evaluation.pass;

  // 안전보건 적격성 판정
  const safetyPass = evaluation.sustainability_score >= 54; // 60% 이상

  // 승인공급업체 여부
  const isApproved = evaluationPass && safetyPass;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 공급업체 평가 결과 */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-center text-center">
          <div className="text-xs font-medium text-gray-600 mb-3">공급업체 평가 결과</div>
          <div className="flex items-center justify-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${evaluationPass ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
            <span className={`text-lg font-bold ${evaluationPass ? 'text-blue-600' : 'text-gray-600'}`}>
              {evaluationPass ? '통과' : '미통과'}
            </span>
          </div>
          <div className="text-xs text-gray-500">{evaluation.final_score.toFixed(1)}점 / 100점</div>
        </div>

        {/* 안전보건 적격성 결과 */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-center text-center">
          <div className="text-xs font-medium text-gray-600 mb-3">안전보건 적격성 결과</div>
          <div className="flex items-center justify-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${safetyPass ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
            <span className={`text-lg font-bold ${safetyPass ? 'text-blue-600' : 'text-gray-600'}`}>
              {safetyPass ? '통과' : '미통과'}
            </span>
          </div>
          <div className="text-xs text-gray-500">{evaluation.sustainability_score.toFixed(1)}점 / 90점</div>
        </div>

        {/* 승인공급업체 해당여부 */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-5 flex flex-col items-center text-center">
          <div className="text-xs font-medium text-gray-600 mb-3">승인공급업체 해당여부</div>
          <div className="flex items-center justify-center mb-2">
            {isApproved ? (
              <>
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg font-bold text-blue-600">해당</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-lg font-bold text-gray-600">미해당</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {isApproved ? '평가 및 안전보건 통과' : '평가 또는 안전보건 미통과'}
          </div>
        </div>

        {/* 카테고리 내 평가순위 */}
        <div className="bg-white rounded-lg border-2 p-5 flex flex-col items-center text-center" style={{ borderColor: '#0085FF' }}>
          <div className="text-xs font-medium text-gray-600 mb-3">카테고리 내 평가순위</div>
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 mr-2 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="text-lg font-bold text-gray-900">
              {categoryRank?.rank}위
            </span>
            <span className="text-sm text-gray-600 ml-1">/ {categoryRank?.total}개사</span>
          </div>
          <div className="text-xs text-gray-500">
            {(evaluation.supplier_group === 'E' && evaluation.detail_group) 
              ? evaluation.detail_group 
              : evaluation.supplier_group} 카테고리
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSummaryBanner;
