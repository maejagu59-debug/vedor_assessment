import React from 'react';

interface SustainabilityDetailsViewProps {
  items: Record<string, number>;
  supplierGroup: string;
}

const SustainabilityDetailsView: React.FC<SustainabilityDetailsViewProps> = ({ items, supplierGroup }) => {
  // 그룹별 질문 정의 함수
  const getQuestionsByGroup = () => {
    const commonQuestions = [
      {
        category: '대외 수행실적',
        questions: [
          {
            id: 'performanceCount',
            text: '대외 수행실적 건수 (동종, 항만거래실적 수, 최근 3개년)',
            options: [
              { value: 5, label: '5개 이상' },
              { value: 4, label: '4개' },
              { value: 3, label: '3개' },
              { value: 2, label: '2개' },
              { value: 1, label: '1개' }
            ]
          },
          {
            id: 'performanceAmount',
            text: '대외 수행금액 (동종, 항만거래금액, 최근 3개년 상위 5개사 거래실적 합계)',
            options: [
              { value: 5, label: '5억 이상' },
              { value: 4, label: '3억 이상 5억 미만' },
              { value: 3, label: '1억 이상 3억 미만' },
              { value: 2, label: '5,000만원 이상 1억 미만' },
              { value: 1, label: '5,000만원 미만' }
            ]
          }
        ]
      }
    ];

    if (supplierGroup === 'A' || supplierGroup === 'E') {
      return [
        ...commonQuestions,
        {
          category: '인력보유상태',
          questions: [
            {
              id: 'adequatePersonnel',
              text: '적정 인력의 보유',
              options: [
                { value: 5, label: '인력보유 비율 100% 이상, 유고인력 즉시 대체가능한 인력풀 보유' },
                { value: 4, label: '인력보유 비율 100% 이상, BCT 전담인력(사무업무 지원등) 운영' },
                { value: 3, label: '인력보유 비율 100%' },
                { value: 2, label: '인력보유 비율 80% 이상 100% 미만' },
                { value: 1, label: '인력보유 비율 80% 미만' }
              ]
            },
            {
              id: 'turnoverRate',
              text: '하수급인 인력관리 능력 (이직율 기준)',
              options: [
                { value: 5, label: '이직율이 5% 미만인 경우' },
                { value: 4, label: '이직율이 5% 이상 ~ 10% 미만인 경우' },
                { value: 3, label: '이직율이 10% 이상 ~ 20% 미만인 경우' },
                { value: 2, label: '이직율이 20% 이상 ~ 30% 미만인 경우' },
                { value: 1, label: '이직율이 30% 이상인 경우' }
              ]
            }
          ]
        },
        {
          category: '수행능력',
          questions: [
            {
              id: 'safetyService',
              text: '안전한 서비스 제공 평가',
              options: [
                { value: 5, label: '안전관련 지적 및 위반 건수 0건' },
                { value: 4, label: '안전관련 지적 및 위반 건수 1건' },
                { value: 3, label: '안전관련 지적 및 위반 건수 2건' },
                { value: 2, label: '안전관련 지적 및 위반 건수 3건' },
                { value: 1, label: '안전관련 지적 및 위반 건수 4건 이상' }
              ]
            },
            {
              id: 'serviceQuality',
              text: 'Service Quality 증진능력',
              options: [
                { value: 5, label: '매우높음' },
                { value: 4, label: '높음' },
                { value: 3, label: '보통' },
                { value: 2, label: '낮음' },
                { value: 1, label: '매우낮음' }
              ]
            },
            {
              id: 'directiveCompliance',
              text: '지시 및 권고사항 이행능력 평가',
              options: [
                { value: 5, label: '지시 및 권고 사항 불이행 0건' },
                { value: 4, label: '지시 및 권고 사항 불이행 1건' },
                { value: 3, label: '지시 및 권고 사항 불이행 2건' },
                { value: 2, label: '지시 및 권고 사항 불이행 3건' },
                { value: 1, label: '지시 및 권고 사항 불이행 4건 이상' }
              ]
            },
            {
              id: 'emergencyResponse',
              text: '사고 및 비상사태 대처능력',
              options: [
                { value: 5, label: '업무협조 우수하며 지연사례 없음' },
                { value: 4, label: '처리 지연 (1회)' },
                { value: 3, label: '처리 지연 (2회~ 3회 or 1개월 초과 발생)' },
                { value: 2, label: '처리 지연 (3회 초과 or 3개월 초과 발생)' },
                { value: 1, label: '사고 및 비상사태 대처능력 없음' }
              ]
            },
            {
              id: 'contractSupport',
              text: '계약관리 지원 및 친절서비스 제공평가',
              options: [
                { value: 5, label: '만족함' },
                { value: 4, label: '대체로 만족함' },
                { value: 3, label: '보통' },
                { value: 2, label: '보다 개선이 필요함' },
                { value: 1, label: '최소한의 수준 이하' }
              ]
            },
            {
              id: 'regulationCompliance',
              text: '소방, 환경 등 법 규제사항 및 처리 실태',
              options: [
                { value: 5, label: '규제사항관련 지적 및 위반 건수 없음' },
                { value: 0, label: '규제사항관련 지적 및 위반 건수 1건 이상' }
              ]
            }
          ]
        },
        {
          category: '손해방지',
          questions: [
            {
              id: 'damagePrevention',
              text: 'BCT의 사업에 손실이나 폐해를 끼친적이 있는지 여부 (최근 3개년)',
              options: [
                { value: 5, label: '없다' },
                { value: 0, label: '있다' }
              ]
            }
          ]
        }
      ];
    } else if (supplierGroup === 'B' || supplierGroup === 'G') {
      return [
        ...commonQuestions,
        {
          category: '수행능력',
          questions: [
            {
              id: 'qualityMgmt',
              text: '품질관리',
              options: [
                { value: 4, label: '품질관리 방식 및 실시상황이 매우 양호' },
                { value: 3, label: '품질관리 방식 및 실시상황이 양호' },
                { value: 2, label: '품질관리 방식 및 실시상황이 미흡' },
                { value: 1, label: '품질관리 방식 및 실시상황이 매우 미흡' }
              ]
            },
            {
              id: 'claimFrequency',
              text: 'CLAIM 발생 빈도',
              options: [
                { value: 4, label: '전체 발주건수대비 1% 미만' },
                { value: 3, label: '전체 발주건수대비 1% 이상 3% 미만' },
                { value: 2, label: '전체 발주건수대비 3% 이상 5% 미만' },
                { value: 1, label: '전체 발주건수대비 5% 이상' }
              ]
            },
            {
              id: 'quotationDelay',
              text: '견적불가 및 지연',
              options: [
                { value: 4, label: '전체 청구건 중 10% 미만' },
                { value: 3, label: '전체 청구건 중 10% 이상 20% 미만' },
                { value: 2, label: '전체 청구건 중 20% 이상 30% 미만' },
                { value: 1, label: '전체 청구건 중 30% 이상' }
              ]
            },
            {
              id: 'specResponse',
              text: '단종 및 SPEC 불명확 자재 대응도',
              options: [
                { value: 4, label: '능동적으로 도면 및 샘플 확보 (장비팀 및 현장)' },
                { value: 3, label: '수동적으로 도면 및 샘플 확보 (경영지원팀으로 요청)' },
                { value: 2, label: '견적 불가로 처리' },
                { value: 1, label: '대응 없음 (PENDING)' }
              ]
            },
            {
              id: 'urgentResponse',
              text: '긴급/소량, 발주 취소 대응 처리건',
              options: [
                { value: 4, label: '요청건 대비 80% 이상' },
                { value: 3, label: '요청건 대비 60% 이상 80% 미만' },
                { value: 2, label: '요청건 대비 40% 이상 60% 미만' },
                { value: 1, label: '요청건 대비 40% 미만' }
              ]
            },
            {
              id: 'deliveryMgmt',
              text: '납기관리',
              options: [
                { value: 4, label: '관리방식이 확립되고 작업의 추진상황이 명확함' },
                { value: 3, label: '납기관리를 행하고 있으며 방법에 개선의 여지가 있음' },
                { value: 2, label: '납기관리를 행하고 있으나 방법에 개선의 여지가 없음' },
                { value: 1, label: '관리상황이 나쁘며 작업의 진보상황이 불명확' }
              ]
            },
            {
              id: 'contractSupport',
              text: '계약관리 지원 및 친절서비스 제공평가',
              options: [
                { value: 4, label: '만족함' },
                { value: 3, label: '보통' },
                { value: 2, label: '보다 개선이 필요함' },
                { value: 1, label: '최소한의 수준 이하' }
              ]
            },
            {
              id: 'regulationCompliance',
              text: '소방, 환경 등 법 규제사항 및 처리 실태',
              options: [
                { value: 4, label: '규제사항관련 지적 및 위반 건수 없음' },
                { value: 0, label: '규제사항관련 지적 및 위반 건수 1건 이상' }
              ]
            }
          ]
        },
        {
          category: '손해방지',
          questions: [
            {
              id: 'damagePrevention',
              text: 'BCT의 사업에 손실이나 폐해를 끼친적이 있는지 여부 (최근 3개년)',
              options: [
                { value: 4, label: '없다' },
                { value: 0, label: '있다' }
              ]
            }
          ]
        }
      ];
    } else if (supplierGroup === 'C') {
      return [
        ...commonQuestions,
        {
          category: '수행능력',
          questions: [
            {
              id: 'qualityMgmt',
              text: '품질관리',
              options: [
                { value: 4, label: '품질관리 방식 및 실시상황이 매우 양호' },
                { value: 3, label: '품질관리 방식 및 실시상황이 양호' },
                { value: 2, label: '품질관리 방식 및 실시상황이 미흡' },
                { value: 1, label: '품질관리 방식 및 실시상황이 매우 미흡' }
              ]
            },
            {
              id: 'durability',
              text: '내구성 뛰어나고, 손상되지 않는 제품을 안정적으로 공급받고 있는지 여부',
              options: [
                { value: 4, label: 'Claim 문제 연간 1건' },
                { value: 3, label: 'Claim 문제 연간 2건' },
                { value: 2, label: 'Claim 문제 연간 3건' },
                { value: 1, label: 'Claim 문제 연간 4건 이상' }
              ]
            },
            {
              id: 'timelyDelivery',
              text: '적시정량 납품',
              options: [
                { value: 4, label: '적시 정량 확보 불가능 0건' },
                { value: 3, label: '적시 정량 확보 불가능 1건' },
                { value: 2, label: '적시 정량 확보 불가능 2건' },
                { value: 1, label: '적시 정량 확보 불가능 3건 이상' }
              ]
            },
            {
              id: 'productVariety',
              text: '취급품목의 다양성 (단종 및 SPEC 불명확 건에 대한 처리능력)',
              options: [
                { value: 4, label: '공급 불가능 제품 0개' },
                { value: 3, label: '공급 불가능 제품 1개' },
                { value: 2, label: '공급 불가능 제품 2개' },
                { value: 1, label: '공급 불가능 제품 3개 이상' }
              ]
            },
            {
              id: 'urgentResponse',
              text: '긴급/소량, 발주 취소 대응 처리건',
              options: [
                { value: 4, label: '요청건 대비 80% 이상' },
                { value: 3, label: '요청건 대비 60% 이상 80% 미만' },
                { value: 2, label: '요청건 대비 40% 이상 60% 미만' },
                { value: 1, label: '요청건 대비 40% 미만' }
              ]
            },
            {
              id: 'deliveryMgmt',
              text: '납기관리',
              options: [
                { value: 4, label: '관리방식이 확립되고 작업의 추진상황이 명확함' },
                { value: 3, label: '납기관리를 행하고 있으며 방법에 개선의 여지가 있음' },
                { value: 2, label: '납기관리를 행하고 있으나 방법에 개선의 여지가 없음' },
                { value: 1, label: '관리상황이 나쁘며 작업의 진보상황이 불명확' }
              ]
            },
            {
              id: 'contractSupport',
              text: '계약관리 지원 및 친절서비스 제공평가',
              options: [
                { value: 4, label: '만족함' },
                { value: 3, label: '보통' },
                { value: 2, label: '보다 개선이 필요함' },
                { value: 1, label: '최소한의 수준 이하' }
              ]
            },
            {
              id: 'regulationCompliance',
              text: '법 규제사항(MSDS 등) 및 처리 실태',
              options: [
                { value: 4, label: '규제사항관련 지적 및 위반 건수 없음' },
                { value: 0, label: '규제사항관련 지적 및 위반 건수 1건 이상' }
              ]
            }
          ]
        },
        {
          category: '손해방지',
          questions: [
            {
              id: 'damagePrevention',
              text: 'BCT의 사업에 손실이나 폐해를 끼친적이 있는지 여부 (최근 3개년)',
              options: [
                { value: 4, label: '없다' },
                { value: 0, label: '있다' }
              ]
            }
          ]
        }
      ];
    } else if (supplierGroup === 'D') {
      return [
        ...commonQuestions,
        {
          category: '수행능력',
          questions: [
            {
              id: 'regularWorkforce',
              text: '상근인력 수',
              options: [
                { value: 4, label: '30명 이상' },
                { value: 3, label: '20명 이상' },
                { value: 2, label: '10명 이상' },
                { value: 1, label: '10명 미만' }
              ]
            },
            {
              id: 'technicalPersonnel',
              text: '기술인력보유',
              options: [
                { value: 4, label: '초급 5명 또는 중급 2명 이상' },
                { value: 3, label: '초급 3명 이상' },
                { value: 2, label: '초급 2명 이상' },
                { value: 1, label: '초급 2명 미만' }
              ]
            },
            {
              id: 'qualitySystem',
              text: '품질관리시스템 (ISO) 인증',
              options: [
                { value: 4, label: 'ISO인증' },
                { value: 3, label: '품질조직 보유' },
                { value: 2, label: '품질유사조직 보유' },
                { value: 1, label: '없음' }
              ]
            },
            {
              id: 'designSupport',
              text: '설계 및 견적지원 능력',
              options: [
                { value: 4, label: '설계 및 기술 지원능력 보유' },
                { value: 3, label: '기술/견적지원 능력보유' },
                { value: 2, label: '견적spec 지원능력' },
                { value: 1, label: '단순가격 견적지원' }
              ]
            },
            {
              id: 'defectManagement',
              text: '하자 및 비상사태 관리',
              options: [
                { value: 4, label: '현장 방문 등 적극적이고 즉각적인 하자 조치 이루어 짐' },
                { value: 3, label: '현장 방문은 없으나 하자의 즉각적인 조치를 취함' },
                { value: 2, label: '현장 방문 없으며, 하자의 즉각적인 조치를 취하지 않음' },
                { value: 1, label: '사후조치 없음' }
              ]
            },
            {
              id: 'deliveryMgmt',
              text: '납기관리',
              options: [
                { value: 4, label: '관리방식이 확립되고 작업의 추진상황이 명확함' },
                { value: 3, label: '납기관리를 행하고 있으며 방법에 개선의 여지가 있음' },
                { value: 2, label: '납기관리를 행하고 있으나 방법에 개선의 여지가 없음' },
                { value: 1, label: '관리상황이 나쁘며 작업의 진보상황이 불명확' }
              ]
            },
            {
              id: 'contractSupport',
              text: '계약관리 지원 및 친절서비스 제공평가',
              options: [
                { value: 4, label: '만족함' },
                { value: 3, label: '보통' },
                { value: 2, label: '보다 개선이 필요함' },
                { value: 1, label: '최소한의 수준 이하' }
              ]
            },
            {
              id: 'regulationCompliance',
              text: '법규준수',
              options: [
                { value: 4, label: '규제사항관련 지적 및 위반 건수 없음' },
                { value: 0, label: '규제사항관련 지적 및 위반 건수 1건 이상' }
              ]
            }
          ]
        },
        {
          category: '손해방지',
          questions: [
            {
              id: 'damagePrevention',
              text: 'BCT의 사업에 손실이나 폐해를 끼친적이 있는지 여부 (최근 3개년)',
              options: [
                { value: 4, label: '없다' },
                { value: 0, label: '있다' }
              ]
            }
          ]
        }
      ];
    }

    return commonQuestions;
  };

  const categories = getQuestionsByGroup();

  const getScoreColor = (score: number) => {
    const maxScore = supplierGroup === 'A' || supplierGroup === 'E' ? 5 : 4;
    if (score >= maxScore) return 'text-green-600';
    if (score >= maxScore * 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h5 className="text-sm font-medium text-gray-900 mb-4">지속가능성 세부 항목</h5>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.category} className="bg-white rounded-lg p-4 border border-gray-100">
            <h6 className="text-sm font-bold text-gray-900 mb-3">{category.category}</h6>
            <div className="space-y-3">
              {category.questions.map((question) => {
                const userScore = items[question.id] || 0;
                const selectedOption = question.options.find(opt => opt.value === userScore);
                
                return (
                  <div key={question.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <p className="text-xs text-gray-700 mb-2 font-medium">{question.text}</p>
                    
                    {/* 배점 기준 */}
                    <div className="ml-3 mb-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-600">배점 기준:</p>
                      {question.options.map(opt => (
                        <p key={opt.value} className="text-xs text-gray-500">
                          • {opt.label} (배점 {opt.value}점)
                        </p>
                      ))}
                    </div>
                    
                    {/* 업체 답변 */}
                    <div className="ml-3 bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs font-semibold text-blue-900 mb-1">선택된 답변:</p>
                      {selectedOption ? (
                        <>
                          <p className="text-xs text-gray-700">{selectedOption.label}</p>
                          <p className={`text-xs font-bold mt-1 ${getScoreColor(userScore)}`}>
                            획득 점수: {userScore}점
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500">답변 없음</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SustainabilityDetailsView;
