import React, { useState, useMemo } from 'react';
import { EvaluationData } from '../../types';
import { EvaluationAnalysisGenerator } from '../../utils/EvaluationAnalysisGenerator';
import { useApp } from '../../contexts/AppContext';

interface EvaluationSectionProps {
  evaluation: EvaluationData;
  allEvaluations: EvaluationData[];
}

const EvaluationSection: React.FC<EvaluationSectionProps> = ({ evaluation, allEvaluations }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showSafetyDetails, setShowSafetyDetails] = useState(false);
  

  
  // 평가 결과 분석 추가
  const evaluationAnalysis = useMemo(() => {
    return EvaluationAnalysisGenerator.generateAnalysis(evaluation, allEvaluations);
  }, [evaluation, allEvaluations]);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'approved':
        return 'bg-gray-900 text-white';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPassBadge = (pass: boolean) => {
    return pass
      ? 'bg-gray-900 text-white border-gray-900'
      : 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // SafetyQuestionnaireDetails 컴포넌트
  const SafetyQuestionnaireDetails: React.FC<{ evaluation: EvaluationData }> = ({ evaluation }) => {
    const { suppliers } = useApp();
    
    // 사업자등록번호로 supplier_info 데이터 찾기
    const supplierInfo = suppliers.find(s => s.rawData.business_number === evaluation.business_number);
    
    if (!(supplierInfo?.rawData as any).safety_questionnaire_responses) {
      return (
        <div className="text-sm text-gray-500 italic">
          안전보건 질의응답 데이터를 찾을 수 없습니다.
        </div>
      );
    }

    let safetyData;
    try {
      safetyData = JSON.parse((supplierInfo!.rawData as any).safety_questionnaire_responses);
    } catch (error) {
      return (
        <div className="text-sm text-red-500">
          안전보건 질의응답 데이터 파싱 오류가 발생했습니다.
        </div>
      );
    }

    const responses = safetyData.responses || {};
    
    // 질문 카테고리별 정의
    const questionCategories = {
      system: {
        title: '안전보건관리체제',
        questions: {
          system_q1: '안전보건관리책임자를 지정하였습니까?',
          system_q2: '안전보건관리규정을 작성하였습니까?',
          system_q3: '위험성평가를 실시하였습니까?'
        }
      },
      exec: {
        title: '경영책임자 의지',
        questions: {
          exec_q1: '경영책임자가 안전보건방침을 수립하였습니까?',
          exec_q2: '안전보건 예산을 편성하였습니까?',
          exec_q3: '정기적인 안전보건 점검을 실시합니까?',
          exec_q4: '안전보건 개선사항을 이행합니까?'
        }
      },
      edu: {
        title: '안전보건교육',
        questions: {
          edu_q1: '신규채용자 안전보건교육을 실시합니까?',
          edu_q2: '정기 안전보건교육을 실시합니까?',
          edu_q3: '작업내용 변경시 안전보건교육을 실시합니까?',
          edu_q4: '특별안전보건교육을 실시합니까?'
        }
      },
      prevent: {
        title: '사고예방활동',
        questions: {
          prevent_q1: '안전점검을 정기적으로 실시합니까?',
          prevent_q2: '위험요인 발견시 즉시 조치합니까?',
          prevent_q3: '개인보호구를 지급하고 착용을 지도합니까?',
          prevent_q4: '안전수칙을 게시하고 준수하도록 합니까?',
          prevent_q5: '산업재해 발생시 보고체계가 구축되어 있습니까?',
          prevent_q6: '응급처치 체계가 구축되어 있습니까?',
          prevent_q7: '화재예방 및 소방시설을 관리합니까?',
          prevent_q8: '작업환경측정을 실시합니까?',
          prevent_q9: '특수건강진단을 실시합니까?',
          prevent_q10: '안전보건표지를 설치하였습니까?'
        }
      },
      cert: {
        title: '자격 및 면허',
        questions: {
          cert_q1: '관련 자격증 및 면허를 보유하고 있습니까?'
        }
      },
      accident: {
        title: '재해현황',
        questions: {
          accident_q1: '최근 3년간 산업재해 발생 현황은?'
        }
      }
    };

    const getScoreColor = (score: number) => {
      if (score >= 5) return 'text-green-600';
      if (score >= 3) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreText = (score: number) => {
      if (score >= 5) return '우수';
      if (score >= 3) return '보통';
      return '미흡';
    };

    return (
      <div className="space-y-4">
        {Object.entries(questionCategories).map(([categoryKey, category]) => (
          <div key={categoryKey} className="bg-gray-50 rounded-lg p-4">
            <h6 className="text-sm font-bold text-gray-900 mb-3">{category.title}</h6>
            <div className="space-y-2">
              {Object.entries(category.questions).map(([questionKey, questionText]) => {
                const score = responses[questionKey] || 0;
                return (
                  <div key={questionKey} className="flex justify-between items-center">
                    <span className="text-xs text-gray-700 flex-1">{questionText}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                        {score}점
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getScoreColor(score)} bg-opacity-10`}>
                        {getScoreText(score)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-blue-900">총 점수</span>
            <span className="text-lg font-bold text-blue-900">
              {supplierInfo!.rawData.safety_questionnaire_score}점 ({supplierInfo!.rawData.safety_questionnaire_grade}등급)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <h3 className="section-title">공급업체 평가 결과</h3>

      {/* 평가 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">안정성 점수</div>
          <div className="text-3xl font-bold text-gray-900">{evaluation.stability_score.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">/ 10점</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">지속가능성 점수</div>
          <div className="text-3xl font-bold text-gray-900">{evaluation.sustainability_score.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">/ 90점</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">원점수 합계</div>
          <div className="text-3xl font-bold text-gray-900">{evaluation.final_score.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">안정성 + 지속가능성</div>
        </div>
      </div>

      {/* 평가 정보 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">평가 그룹</div>
            <div className="text-sm font-medium text-gray-900 mt-1">{evaluation.supplier_group}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">평가 일자</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {new Date(evaluation.evaluation_date).toLocaleDateString('ko-KR')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">평가자</div>
            <div className="text-sm font-medium text-gray-900 mt-1">{evaluation.initiator}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">승인자</div>
            <div className="text-sm font-medium text-gray-900 mt-1">{evaluation.approver}</div>
          </div>
        </div>
      </div>

      {/* 평가 상태 */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(evaluation.status)}`}>
          {evaluation.status === 'pending' ? '검토 중' : evaluation.status === 'approved' ? '승인됨' : '초안'}
        </span>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getPassBadge(evaluation.pass)}`}>
          {evaluation.pass ? '합격' : '불합격'}
        </span>
        {evaluation.safety_passed && (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-900 text-white">
            안전 통과
          </span>
        )}
      </div>

      {/* 평가 결과 분석 */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          평가 결과 분석
        </h4>
        
        {/* 요약 */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{evaluationAnalysis.summary}</p>
        </div>

        {/* 그룹 비교 */}
        <div className="mb-4 p-4 bg-white rounded-lg">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">그룹 내 위치</h5>
          <p className="text-sm text-gray-700 leading-relaxed">{evaluationAnalysis.groupComparison}</p>
        </div>

        {/* 강점과 약점 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 강점 */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              강점 항목
            </h5>
            {evaluationAnalysis.strengths.length > 0 ? (
              <ul className="space-y-1">
                {evaluationAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ backgroundColor: '#0085FF' }}></span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">만점 항목이 없습니다.</p>
            )}
          </div>

          {/* 약점 */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              개선 필요 항목
            </h5>
            {evaluationAnalysis.weaknesses.length > 0 ? (
              <ul className="space-y-1">
                {evaluationAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">개선이 필요한 항목이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 개선 권고사항 */}
        {evaluationAnalysis.weaknesses.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 border-l-4 border-gray-400 rounded">
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">개선 권고:</strong> 평가 결과 낮은 점수를 받은 일부 항목에 대해서는 협력업체의 개선 계획 수립 여부를 검토하는 것이 안정적인 컨테이너터미널 공급망 관리 체계 확립을 위해 필수적입니다. 
              다음 평가 시 해당 항목들의 개선 이행 여부를 면밀히 검토하고 결과에 반영하여 지속 가능한 공급망 관리 체계를 구축하는 것이 필요합니다.
            </p>
          </div>
        )}
      </div>

      {/* 세부 평가 항목 토글 */}
      <div className="mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-4 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">세부 평가 항목 보기</span>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            {/* 안정성 세부 항목 */}
            {evaluation.stability_details && typeof evaluation.stability_details === 'object' && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-3">안정성 세부 항목</h5>
                <div className="space-y-2">
                  {Object.entries(evaluation.stability_details).map(([key, value]) => {
                    if (key === 'conversion' || key === 'totalScore') return null;
                    const score = Number(value);
                    const labels: Record<string, string> = {
                      debt: '부채 관리',
                      equity: '자기자본',
                      expertise: '전문성',
                      liquidity: '유동성',
                    };
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">{labels[key] || key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${(score / 5) * 100}%`, backgroundColor: '#0085FF' }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 w-8 text-right">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 지속가능성 세부 항목 */}
            {evaluation.sustainability_details?.items && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-3">지속가능성 세부 항목</h5>
                <div className="space-y-2">
                  {Object.entries(evaluation.sustainability_details.items).map(([key, value]) => {
                    const score = Number(value);
                    const labels: Record<string, string> = {
                      adequatePersonnel: '적정 인력',
                      contractSupport: '계약 지원',
                      damagePrevention: '사고 예방',
                      directiveCompliance: '지시 준수',
                      emergencyResponse: '비상 대응',
                      performanceAmount: '실적 규모',
                      performanceCount: '실적 건수',
                      regulationCompliance: '법규 준수',
                      safetyService: '안전 서비스',
                      serviceQuality: '서비스 품질',
                      turnoverRate: '이직률 관리',
                      claimFrequency: '클레임 빈도',
                      deliveryMgmt: '납기 관리',
                      durability: '내구성',
                      productVariety: '제품 다양성',
                      qualityMgmt: '품질 관리',
                      quotationDelay: '견적 지연',
                      specResponse: '사양 대응',
                      timelyDelivery: '정시 납품',
                      urgentResponse: '긴급 대응',
                    };
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">{labels[key] || key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${(score / 5) * 100}%`, backgroundColor: '#0085FF' }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 w-8 text-right">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 평가자 의견 */}
      {(evaluation.stability_remarks || evaluation.sustainability_remarks) && (
        <div className="space-y-3">
          {evaluation.stability_remarks && (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-900 mb-1">안정성 평가 의견</h4>
              <p className="text-sm text-gray-700">{evaluation.stability_remarks}</p>
            </div>
          )}
          {evaluation.sustainability_remarks && (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-900 mb-1">지속가능성 평가 의견</h4>
              <p className="text-sm text-gray-700">{evaluation.sustainability_remarks}</p>
            </div>
          )}
        </div>
      )}

      {/* 안전보건 적격성 분석 */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="bg-gray-50 border-l-4 border-gray-900 p-6 rounded-xl">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-gray-900 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">안전보건 적격성 분석</h4>
              
              {/* 종합 점수 */}
              <div className="mb-6 p-5 bg-white rounded-xl border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">원점수 (평가 결과)</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {evaluation.final_score?.toFixed(1)}점
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">적격 기준</span>
                  <span className="text-base font-semibold text-gray-700">60점 이상</span>
                </div>
              </div>

              {/* 1. 안전보건관리체제 및 법규 준수 분석 */}
              <div className="mb-6 space-y-4">
                <h5 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
                  1. 안전보건관리체제 및 법규 준수 분석
                </h5>
                
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                  <p className="font-medium text-gray-800">
                    [안전보건: 법적 요구사항과 안전보건관리체제 구축 수준 평가]
                  </p>
                  
                  <div className="pl-4 space-y-2">
                    <p>
                      <span className="font-semibold text-gray-900">• 안전보건관리체제 구축:</span> {evaluation.supplier_name}은(는) 
                      안전보건관리책임자 및 관리감독자 지정, 안전보건관리규정 작성 등 기본적인 안전보건관리체제(산업안전보건법 제15조, 제16조)를 
                      {evaluation.final_score >= 80 ? '체계적으로 갖추고 있으며' : '갖추려는 노력을 보이고 있으나'}, 
                      위험성 평가 및 실행력 확보가 {evaluation.final_score >= 80 ? '우수한 수준입니다' : '요구됩니다'}.
                    </p>
                    
                    <p>
                      <span className="font-semibold text-gray-900">• 작업환경 및 건강관리:</span> 유해인자 노출 작업자에 대한 
                      특수건강진단 이행(제130조) 및 작업환경측정 조치가 {evaluation.final_score >= 70 ? '양호하게' : '부분적으로'} 
                      확인되어, 법정 보건 관리 의무 이행 수준은 {evaluation.final_score >= 70 ? '적정' : '개선 필요'}한 것으로 분석됩니다.
                    </p>
                    
                    <p>
                      <span className="font-semibold text-gray-900">• 설비 및 기계 안전:</span> 유해·위험 기계에 대한 방호조치 이행 및 
                      안전인증 제품 사용(제93조, 제84조)이 {evaluation.final_score >= 75 ? '적절히' : '부분적으로'} 확인되었습니다. 
                      {evaluation.final_score >= 75 
                        ? '이는 설비 사용의 직접적인 재해 위험을 관리하는 기본 조치로서 적정한 수준을 유지하고 있습니다.' 
                        : '설비 사용의 직접적인 재해 위험을 관리하는 기본 조치이나, 미흡 시 중대재해 발생 가능성이 높아 즉각적인 개선이 요구됩니다.'}
                    </p>
                    
                    <p>
                      <span className="font-semibold text-gray-900">• 도급인과의 협력 체계:</span> 작업 현장의 혼재 작업에 대비한 
                      신호 및 연락 체계 구축이 {evaluation.final_score >= 70 ? '양호하게' : '기본적으로'} 확인되었습니다. 
                      이는 도급인의 안전 조치 의무(제64조) 이행을 보조하는 필수적인 협력 요소입니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 공급망 리스크 및 사업 연속성 평가 */}
              <div className="mb-6 space-y-4">
                <h5 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
                  2. 공급망 리스크 및 사업 연속성 평가
                </h5>
                
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                  <p className="font-medium text-gray-800">
                    [공급망 리스크: 안전보건 성과가 공급망 안정성에 미치는 영향 평가]
                  </p>
                  
                  <div className="pl-4 space-y-2">
                    <p>
                      안전보건 평가는 단순한 규정 준수를 넘어, 공급망 내재 리스크를 정량적으로 관리하기 위한 핵심 프로세스입니다. 
                      안전보건 역량이 높은 협력사는 재해로 인한 작업 중단, 인력 이탈, 법적 제재 리스크가 낮아 
                      <span className="font-semibold"> 계약 이행의 안정성(사업 연속성, BCP)</span>이 높다고 평가됩니다.
                    </p>
                    
                    <p>
                      <span className="font-semibold text-gray-900">• 재해 발생 리스크:</span> {evaluation.supplier_name}의 
                      평가 점수 {evaluation.final_score.toFixed(1)}점은 잠재적 재해 발생 확률을 
                      {evaluation.final_score >= 80 ? '낮음' : evaluation.final_score >= 60 ? '보통' : '높음'} 수준으로 판단하며, 
                      이는 서비스/자재 공급 중단 위험이 {evaluation.final_score >= 80 ? '낮음' : '관리 필요'}을 의미합니다.
                    </p>
                    
                    <p>
                      <span className="font-semibold text-gray-900">• 재정적 리스크 관리:</span> 수급인의 안전 관리 미흡은 
                      향후 산업재해 발생 시 도급인의 책임 범위 확대 및 과태료/벌칙(산업안전보건법 제167조 이하)으로 이어질 수 있는 
                      직접적인 재정적 손실 리스크입니다. 본 평가는 이러한 잠재적 비용을 사전에 억제하는 효과를 가집니다.
                    </p>
                    
                    <p>
                      <span className="font-semibold text-gray-900">• 협력 관계의 질:</span> 안전 관련 신호/연락 체계 구축 수준이 
                      {evaluation.final_score >= 70 ? '우수하여' : '확인되어'}, 수급인이 당사와의 협력적인 안전보건 관계 구축 의지가 
                      {evaluation.final_score >= 70 ? '강함' : '있음'}을 나타내며, 이는 향후 작업 효율성과 품질 관리에도 
                      긍정적으로 작용할 것으로 기대됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 최종 적격성 판단 */}
              <div className="mt-6 pt-6 border-t-2 border-gray-300">
                <h5 className="text-base font-bold text-gray-900 mb-4">최종 적격 수급인 선정 결과</h5>
                
                {evaluation.safety_passed && evaluation.final_score >= 80 ? (
                  <div className="p-5 bg-white rounded-xl border-2" style={{ borderColor: '#0085FF' }}>
                    <div className="flex items-start mb-3">
                      <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#0085FF' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-bold text-lg mb-2" style={{ color: '#0085FF' }}>✓ 적격 수급인 선정</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {evaluation.supplier_name}은(는) 산업안전보건법상 요구되는 기본적인 안전보건관리 역량과 법규 준수 의지를 갖춘 것으로 판단되며, 
                          협력 작업을 위한 안전보건 적격성이 인정됩니다. 공급망 리스크가 낮은 우수 협력사로 판단되어 정식 계약 절차를 진행합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : evaluation.safety_passed && evaluation.final_score >= 60 ? (
                  <div className="p-5 bg-white rounded-xl border-2 border-gray-400">
                    <div className="flex items-start mb-3">
                      <svg className="w-6 h-6 text-gray-700 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-bold text-lg text-gray-900 mb-2">△ 조건부 적격</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          기술적 역량은 인정되나, 안전보건 분야 일부 항목에 대한 명확한 개선 계획(Action Plan) 제출을 조건으로 계약을 추진합니다. 
                          계약 후 30일 이내 개선 완료 여부를 확인하는 후속 안전 감사(Audit)를 필수적으로 진행해야 합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-white rounded-xl border-2" style={{ borderColor: '#F76785' }}>
                    <div className="flex items-start mb-3">
                      <svg className="w-6 h-6 mr-2 flex-shrink-0" style={{ color: '#F76785' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-bold text-lg mb-2" style={{ color: '#F76785' }}>✕ 부적격</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          안전보건 역량이 당사의 최소 기준을 충족하지 못하므로, 현 상태로는 계약 체결이 불가합니다. 
                          재평가를 위해서는 핵심 안전보건관리 항목에 대한 완벽한 개선 및 증빙 자료 제출이 요구됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 세부평가 항목보기 버튼 */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowSafetyDetails(!showSafetyDetails)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{showSafetyDetails ? '세부평가 항목 닫기' : '세부평가 항목보기'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showSafetyDetails ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showSafetyDetails && (
                    <div className="mt-4 p-6 bg-white rounded-xl border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h6 className="text-base font-bold text-gray-900">안전보건관리질의서 세부평가</h6>
                        <span className="text-sm text-gray-500">평가점수, 평가항목, 평가기준</span>
                      </div>
                      <SafetyQuestionnaireDetails evaluation={evaluation} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSection;
