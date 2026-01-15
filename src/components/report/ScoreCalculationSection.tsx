import React, { useState, useEffect } from 'react';
import { EvaluationData } from '../../types';
import { EvaluationScoreCalculator } from '../../utils/EvaluationScoreCalculator';
import TransactionDataInput from './TransactionDataInput';
import { useApp } from '../../contexts/AppContext';

interface ScoreCalculationSectionProps {
  evaluation: EvaluationData;
  allEvaluations: EvaluationData[];
  onScoreCalculated?: (score: number) => void;
}

const ScoreCalculationSection: React.FC<ScoreCalculationSectionProps> = ({
  evaluation,
  allEvaluations,
  onScoreCalculated,
}) => {
  const { isAdmin } = useApp();
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [scoreResult, setScoreResult] = useState<ReturnType<typeof EvaluationScoreCalculator.applyStandardizedScoring> | null>(null);

  // 저장된 거래 데이터 로드
  useEffect(() => {
    loadTransactionData();
  }, [evaluation.business_number]);

  useEffect(() => {
    calculateScore();
  }, [transactionAmount, transactionCount, evaluation]);

  const loadTransactionData = () => {
    try {
      // 사업자등록번호를 키로 사용
      const storageKey = `transaction_data_${evaluation.business_number}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data = JSON.parse(stored);
        setTransactionAmount(data.transaction_amount || 0);
        setTransactionCount(data.transaction_count || 0);
      }
    } catch (error) {
      console.error('거래 데이터 로드 실패:', error);
    }
  };

  const calculateScore = () => {
    const result = EvaluationScoreCalculator.applyStandardizedScoring(
      evaluation,
      allEvaluations,
      transactionAmount,
      transactionCount
    );
    setScoreResult(result);
    
    // 부모 컴포넌트에 점수 전달
    if (onScoreCalculated) {
      onScoreCalculated(result.finalConvertedScore);
    }
  };

  const handleTransactionDataChange = (amount: number, count: number) => {
    setTransactionAmount(amount);
    setTransactionCount(count);
  };

  if (!scoreResult) return null;

  const getGradeBadgeStyle = () => {
    // 우수 협력사 배지는 #0085FF
    return { backgroundColor: '#0085FF', color: 'white' };
  };

  return (
    <div className="space-y-6">
      {/* 거래 데이터 입력 (관리자만) */}
      {isAdmin && (
        <TransactionDataInput
          supplierId={evaluation.id}
          supplierName={evaluation.supplier_name}
          businessNumber={evaluation.business_number}
          onDataChange={handleTransactionDataChange}
        />
      )}

      {/* 점수 계산 결과 */}
      <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
        <h3 className="section-title">공급업체 평가 점수 계산</h3>

        {/* 최종 결과 */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6" style={{ border: '2px solid #0085FF' }}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">최종 변환점수 (M)</h4>
              <div className="text-5xl font-bold text-gray-900">
                {scoreResult.finalConvertedScore.toFixed(2)}
                <span className="text-2xl text-gray-600 ml-2">점</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-2 text-lg font-bold rounded-full" style={getGradeBadgeStyle()}>
                {scoreResult.grade}
              </span>
              <p className="mt-2 text-sm text-gray-600 max-w-xs">
                {scoreResult.gradeDescription}
              </p>
            </div>
          </div>
        </div>

        {/* 계산 과정 */}
        <div className="space-y-4">
          <h4 className="text-md font-bold text-gray-900 mb-3">계산 과정</h4>

          {/* 원점수 및 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">원점수 (F)</div>
              <div className="text-2xl font-bold text-gray-900">{scoreResult.rawScore.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">평균점수 (G)</div>
              <div className="text-2xl font-bold text-gray-900">{scoreResult.categoryMean.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">표준편차 (H)</div>
              <div className="text-2xl font-bold text-gray-900">{scoreResult.categoryStdDev.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">가중치 (I)</div>
              <div className="text-2xl font-bold text-gray-900">{(scoreResult.categoryWeight * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* 거래 데이터 (관리자만) */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <div className="text-xs text-gray-600 mb-1">거래금액 (J)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {scoreResult.transactionAmount.toFixed(2)}
                  <span className="text-sm font-normal ml-1">억원</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <div className="text-xs text-gray-600 mb-1">거래횟수 (K)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {scoreResult.transactionCount.toLocaleString()}
                  <span className="text-sm font-normal ml-1">회</span>
                </div>
              </div>
            </div>
          )}

          {/* 계산 공식 */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">표준변환 증감점수 계산</h5>
            <div className="text-sm text-gray-700 space-y-3">
              <div className="text-sm mt-1">
                표준변환 증감점수 = ((원점수 - 평균점수) / 표준편차 × 가중치 × 20) + (거래금액 × 거래횟수 × 0.001)
              </div>
              <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
                = (({scoreResult.rawScore.toFixed(2)} - {scoreResult.categoryMean.toFixed(2)}) / {scoreResult.categoryStdDev.toFixed(2)} × {scoreResult.categoryWeight} × 20) + ({scoreResult.transactionAmount.toFixed(2)} × {scoreResult.transactionCount} × 0.001)
              </div>
              <div className="text-lg font-bold text-gray-900 mt-2">
                = {scoreResult.adjustmentScore.toFixed(2)} 점
              </div>
            </div>
          </div>

          {/* 최종 점수 계산 */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">최종 변환점수 계산</h5>
            <div className="text-sm text-gray-700 space-y-3">
              <div className="text-sm mt-1">
                최종 변환점수 = 원점수 + 표준변환 증감점수
              </div>
              <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
                = {scoreResult.rawScore.toFixed(2)} + {scoreResult.adjustmentScore.toFixed(2)}
              </div>
              <div className="text-lg font-bold text-gray-900 mt-2">
                = {scoreResult.finalConvertedScore.toFixed(2)} 점
              </div>
            </div>
          </div>
        </div>

        {/* 등급 기준 안내 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="text-sm font-bold text-gray-900 mb-3">등급 기준</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div 
              className="rounded-xl p-3"
              style={{ 
                backgroundColor: scoreResult.grade === '우수 협력사' ? '#0085FF' : '#f3f4f6',
                color: scoreResult.grade === '우수 협력사' ? 'white' : '#111827'
              }}
            >
              <div className="text-xs font-bold">우수 협력사</div>
              <div className="text-sm mt-1">90점 이상</div>
            </div>
            <div 
              className="rounded-xl p-3"
              style={{ 
                backgroundColor: scoreResult.grade === '준수한 협력사' ? '#0085FF' : '#f3f4f6',
                color: scoreResult.grade === '준수한 협력사' ? 'white' : '#111827'
              }}
            >
              <div className="text-xs font-bold">준수한 협력사</div>
              <div className="text-sm mt-1">80점 이상</div>
            </div>
            <div 
              className="rounded-xl p-3"
              style={{ 
                backgroundColor: scoreResult.grade === '승인 공급업체' ? '#0085FF' : '#f3f4f6',
                color: scoreResult.grade === '승인 공급업체' ? 'white' : '#111827'
              }}
            >
              <div className="text-xs font-bold">승인 공급업체</div>
              <div className="text-sm mt-1">60점 이상</div>
            </div>
            <div 
              className="rounded-xl p-3"
              style={{ 
                backgroundColor: scoreResult.grade === '제외 대상' ? '#0085FF' : '#f3f4f6',
                color: scoreResult.grade === '제외 대상' ? 'white' : '#111827'
              }}
            >
              <div className="text-xs font-bold">제외 대상</div>
              <div className="text-sm mt-1">60점 미만</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCalculationSection;
