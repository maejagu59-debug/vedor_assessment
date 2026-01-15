import React from 'react';
import { SupplierReport } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { EvaluationAnalyzer } from '../../utils/EvaluationAnalyzer';
import EditableAnalysis from './EditableAnalysis';

interface OverallRecommendationSectionProps {
  supplier: SupplierReport;
}

const OverallRecommendationSection: React.FC<OverallRecommendationSectionProps> = ({
  supplier,
}) => {
  const { analysis, rawData, evaluation } = supplier;
  const { isAdmin, updateSupplierAnalysis } = useApp();
  
  // 평가 분석 데이터 (평가가 있는 경우)
  const evaluationAnalysis = evaluation ? EvaluationAnalyzer.analyzeEvaluation(evaluation) : null;

  const handleSaveRecommendation = (newContent: string) => {
    updateSupplierAnalysis(rawData.id, { overallRecommendation: newContent });
  };

  const getRiskConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return {
          color: 'bg-gray-900',
          textColor: 'text-white',
          borderColor: 'border-gray-400',
          bgLight: 'bg-gray-50',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: '낮은 리스크',
          description: '안정적인 거래 파트너',
        };
      case 'MEDIUM':
        return {
          color: 'bg-gray-600',
          textColor: 'text-white',
          borderColor: 'border-gray-400',
          bgLight: 'bg-gray-50',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: '중간 리스크',
          description: '주의 깊은 관리 필요',
        };
      case 'HIGH':
        return {
          color: 'bg-gray-400',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-400',
          bgLight: 'bg-gray-50',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: '높은 리스크',
          description: '신중한 접근 필요',
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-white',
          borderColor: 'border-gray-500',
          bgLight: 'bg-gray-50',
          icon: null,
          label: '알 수 없음',
          description: '',
        };
    }
  };

  const riskConfig = getRiskConfig(analysis.riskLevel);

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <h3 className="section-title">종합 의견 및 거래 전략</h3>

      {/* 리스크 레벨 및 종합 의견 */}
      <div className={`${riskConfig.bgLight} border-l-4 ${riskConfig.borderColor} p-5 rounded mb-6`}>
        <div className="flex items-start">
          <div className={`${riskConfig.color} ${riskConfig.textColor} rounded-full p-2 flex-shrink-0`}>
            {riskConfig.icon}
          </div>
          <div className="ml-4 flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">{riskConfig.label}</h4>
            <p className="text-sm text-gray-600 mb-4">{riskConfig.description}</p>
            
            {/* 종합 의견 내용 */}
            <div className="mt-3 pt-3 border-t border-gray-300">
              <EditableAnalysis
                title=""
                content={analysis.overallRecommendation}
                onSave={handleSaveRecommendation}
                isAdmin={isAdmin}
                bgColor="bg-transparent"
                borderColor="border-transparent"
                iconColor="text-gray-900"
                showTitle={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 즉시 실행 가능한 조치사항 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          즉시 실행 가능한 조치사항
        </h4>
        <ul className="space-y-2">
          {analysis.riskLevel === 'LOW' && (
            <>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="#0085FF" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>장기 계약 체결:</strong> 3년 이상 장기 공급 계약을 통한 안정적 파트너십 구축</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="#0085FF" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>협력 강화:</strong> 공동 개선 활동 및 우수 사례 공유를 통한 상호 성장</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="#0085FF" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>정기 평가:</strong> 분기별 성과 평가 및 연간 전략 회의 실시</span>
              </li>
            </>
          )}
          {analysis.riskLevel === 'MEDIUM' && (
            <>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>성과 모니터링:</strong> 월별 KPI 추적 및 분기별 개선 회의 실시</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>개선 계획:</strong> 취약 영역에 대한 구체적 개선 목표 설정 및 이행 점검</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>조건부 계약:</strong> 중기 계약(1-2년) 체결 및 성과 기반 갱신 조건 설정</span>
              </li>
            </>
          )}
          {analysis.riskLevel === 'HIGH' && (
            <>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>리스크 관리:</strong> 거래 금액 및 기간 제한, 주간 단위 모니터링 실시</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>대체 공급업체:</strong> 즉시 대체 공급업체 발굴 및 이중 공급 체계 구축</span>
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>개선 요구:</strong> 즉각적인 개선 조치 요구 및 미이행 시 계약 해지 검토</span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* 평가 기반 종합 분석 (평가 데이터가 있는 경우) */}
      {evaluationAnalysis && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
          {/* 1. 평가 종합 요약 */}
          <EditableAnalysis
            title="평가 종합 요약"
            content={`${evaluationAnalysis.categoryDescription}\n\n${evaluationAnalysis.keyPerformanceInsights}`}
            onSave={(newContent) => {
              // 평가 종합 요약 저장 로직 (추후 구현)
              console.log('평가 종합 요약 저장:', newContent);
            }}
            isAdmin={isAdmin}
            bgColor="bg-gray-50"
            borderColor="border-gray-400"
            iconColor="text-gray-900"
            icon={
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            }
          />

          {/* 2. 리스크 및 기회 분석 */}
          <EditableAnalysis
            title="리스크 및 기회 분석"
            content={`${evaluationAnalysis.operationalRiskAssessment}\n\n${evaluationAnalysis.supplierPositioning}`}
            onSave={(newContent) => {
              // 리스크 및 기회 분석 저장 로직 (추후 구현)
              console.log('리스크 및 기회 분석 저장:', newContent);
            }}
            isAdmin={isAdmin}
            bgColor="bg-gray-50"
            borderColor="border-gray-400"
            iconColor="text-gray-900"
            icon={
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
          />

          {/* 3. 실행 전략 및 제언 */}
          <EditableAnalysis
            title="실행 전략 및 제언"
            content={evaluationAnalysis.strategicRecommendation}
            onSave={(newContent) => {
              // 실행 전략 및 제언 저장 로직 (추후 구현)
              console.log('실행 전략 및 제언 저장:', newContent);
            }}
            isAdmin={isAdmin}
            bgColor="bg-gray-50"
            borderColor="border-gray-400"
            iconColor="text-gray-900"
            icon={
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      )}
    </div>
  );
};

export default OverallRecommendationSection;
