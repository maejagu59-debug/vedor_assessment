import React, { useMemo } from 'react';
import { EvaluationData } from '../../types';
import { BenchmarkingAnalyzer } from '../../utils/BenchmarkingAnalyzer';

interface BenchmarkingSectionProps {
  evaluation: EvaluationData;
  allEvaluations: EvaluationData[];
}

const BenchmarkingSection: React.FC<BenchmarkingSectionProps> = ({
  evaluation,
  allEvaluations,
}) => {
  const analysis = useMemo(() => {
    return BenchmarkingAnalyzer.analyzeBenchmark(evaluation, allEvaluations);
  }, [evaluation, allEvaluations]);

  const radarData = useMemo(() => {
    return BenchmarkingAnalyzer.generateRadarData(evaluation, allEvaluations);
  }, [evaluation, allEvaluations]);

  // 4분면 포지셔닝 데이터
  const positioningData = useMemo(() => {
    // E 그룹이고 세부 그룹이 있는 경우에만 세부 그룹으로 필터링
    const groupEvaluations = allEvaluations.filter(e => {
      if (evaluation.supplier_group === 'E' && evaluation.detail_group) {
        return e.detail_group === evaluation.detail_group;
      } else {
        return e.supplier_group === evaluation.supplier_group;
      }
    });

    // 평균 계산
    const avgStability = groupEvaluations.reduce((sum, e) => sum + e.stability_score, 0) / groupEvaluations.length;
    const avgSustainability = groupEvaluations.reduce((sum, e) => sum + e.sustainability_score, 0) / groupEvaluations.length;

    // 모든 업체 포지션
    const positions = groupEvaluations.map(e => ({
      name: e.supplier_name,
      x: (e.stability_score / 10) * 100, // 10점 만점을 100%로 환산
      y: (e.sustainability_score / 90) * 100, // 90점 만점을 100%로 환산
      isCurrent: e.supplier_name === evaluation.supplier_name,
      score: e.final_score,
    }));

    return {
      positions,
      avgX: (avgStability / 10) * 100,
      avgY: (avgSustainability / 90) * 100,
    };
  }, [evaluation, allEvaluations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-gray-900 bg-gray-100';
      case 'good':
        return 'text-gray-900 bg-gray-100';
      case 'average':
        return 'text-gray-700 bg-gray-50';
      case 'below_average':
        return 'text-gray-700 bg-gray-50';
      case 'poor':
        return 'text-gray-700 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent':
        return '우수';
      case 'good':
        return '양호';
      case 'average':
        return '보통';
      case 'below_average':
        return '미흡';
      case 'poor':
        return '부진';
      default:
        return '-';
    }
  };

  // 카테고리 설명 가져오기
  const getCategoryDescription = (group: string): string => {
    const categories: Record<string, string> = {
      'A': '【주요 외주용역】 본 카테고리는 터미널 운영의 핵심 인력을 제공하는 영역으로, 공급업체의 인력 수급 안정성과 숙련도가 운영 연속성에 직접적인 영향을 미칩니다. 계약 규모가 크고 이사회 승인을 요하는 만큼, 업체의 재무 건전성, 인력 관리 역량, 노사관계 안정성이 핵심 리스크 요인이며, 대체 공급업체 확보의 어려움으로 인한 공급 집중도 리스크 관리가 필요합니다.',
      'B': '【자재(정비, 운영)】 하역장비의 가동률과 직결되는 카테고리로, 부품 공급 지연 시 장비 다운타임으로 인한 터미널 운영 차질이 발생할 수 있습니다. 특히 특수 부품의 경우 납기 지연, 재고 부족, 제조사 단종 등의 리스크가 존재하며, 공급업체의 재고 관리 능력, 긴급 대응 체계, 대체품 조달 역량이 중요한 평가 요소입니다.',
      'C': '【연료비(유류 외)】 국제유가 및 환율 변동에 민감한 카테고리로, 가격 변동성이 매우 크고 구매비용 예측이 어려워 예산 관리의 불확실성이 높습니다. 공급업체의 가격 투명성, 시장 가격 연동 메커니즘의 합리성, 안정적 공급 능력이 핵심이며, 에너지 비용 급등 시 운영비 증가에 따른 재무적 리스크 관리가 필요합니다.',
      'D': '【시설공사】 발생 빈도는 낮으나 한 번 발생 시 대규모 투자가 소요되며, 항만 전문성이 필수적인 카테고리입니다. 공사 지연 시 터미널 운영에 직접적인 영향을 미칠 수 있어, 업체의 기술력, 시공 경험, 공기 준수 능력이 중요하며, 하자 발생 시 장기적인 유지보수 비용 증가 리스크가 존재합니다.',
      'E1': '【외주용역(냉동모니터링, 시설관리)】 터미널 운영에 필요한 전문 기술 용역으로, 업체의 전문성 부족 시 화물 손상, 시설 관리 미흡 등의 문제가 발생할 수 있습니다. 특히 냉동컨테이너 관리는 온도 이탈 시 고객 클레임 및 화물 손실로 이어질 수 있어, 공급업체의 기술 인력 보유 수준과 모니터링 시스템의 신뢰성이 핵심 관리 포인트입니다.',
      'E2': '【One-Stop Service(줄잡이)】 고연령 작업자 중심의 저임금 구조로 인해 안전사고 발생률이 높은 고위험 카테고리입니다. 선박 입출항의 안전성과 직결되어 있어, 공급업체의 안전관리 체계, 작업자 교육훈련 수준, 안전장비 지급 및 관리 실태가 중요하며, 사고 발생 시 운영 중단 및 법적 책임 리스크가 존재합니다.',
      'E3': '【임직원복지관련 용역(구내식당, 통근버스, 구내셔틀)】 도급금액은 높지 않으나 임직원 만족도와 직결되는 카테고리로, 서비스 품질 저하 시 직원 사기 및 생산성에 부정적 영향을 미칩니다. 공급업체의 서비스 제공 안정성, 위생 관리 수준, 돌발 상황 대응 능력이 중요하며, 특히 식품 안전사고 발생 시 조직 전체에 미치는 영향이 클 수 있습니다.',
      'E4': '【기타용역】 각 분야별 전문성이 요구되는 소규모 용역들로 구성되어 있어, 업체별 전문 역량 검증이 중요합니다. 세관검사, 소방시설 등 법규 준수가 필요한 영역의 경우 업체의 관리 소홀 시 법적 제재 리스크가 있으며, 해당 분야 자격 및 인증 보유 여부, 정기 점검 이행 수준이 핵심 관리 요소입니다.',
      'F': '【물류/운송 분야】 컨테이너 육상 운송(드레이지), 셔틀 서비스, 내륙 운송 등을 담당하는 업체입니다. 정시 배송과 차량 관리 능력이 터미널-고객 간 물류 흐름의 원활함을 결정하며, 운송 지연 시 고객 클레임 및 물류 차질이 발생할 수 있습니다.',
      'G': '【소모품(기타)/일반(기타)】 일상 업무 운영에 필수적인 소모품 공급 카테고리로, 개별 품목의 중요도는 낮으나 공급 중단 시 업무 효율성 저하가 발생할 수 있습니다. 특히 안전화, 장갑 등 안전 관련 소모품의 경우 품질 불량 시 안전사고로 이어질 수 있어, 공급업체의 납기 준수율, 품질 일관성, 긴급 대응 능력이 중요한 관리 포인트입니다.',
    };
    return categories[group] || '【기타 분야】 컨테이너터미널 운영을 지원하는 다양한 서비스를 제공하는 업체입니다.';
  };

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <h2 className="section-title">카테고리 내 벤치마킹 분석</h2>

      {/* 카테고리 설명 */}
      <div className="mb-6 p-5 bg-gray-50 rounded-lg border-l-4 border-gray-400">
        <div className="flex items-start">
          <svg className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {(evaluation.supplier_group === 'E' && evaluation.detail_group) 
                ? evaluation.detail_group 
                : evaluation.supplier_group} 카테고리 특성
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getCategoryDescription(
                (evaluation.supplier_group === 'E' && evaluation.detail_group) 
                  ? evaluation.detail_group 
                  : evaluation.supplier_group
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 4분면 포지셔닝 차트 */}
      <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리 내 포지셔닝 맵</h3>
        <div className="relative w-full aspect-square max-w-2xl mx-auto bg-white border-2 border-gray-300 rounded-lg">
          {/* 4분면 배경 */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {/* 좌하단: 성장 잠재 파트너 */}
            <div className="border-r border-t border-gray-300 flex items-start justify-start p-3">
              <span className="text-xs font-semibold text-gray-400">성장 잠재 파트너</span>
            </div>
            {/* 우하단: 전략적 파트너 */}
            <div className="border-t border-gray-300 flex items-start justify-end p-3">
              <span className="text-xs font-semibold text-gray-400">전략적 파트너</span>
            </div>
            {/* 좌상단: 재검토 대상 */}
            <div className="border-r border-gray-300 flex items-end justify-start p-3">
              <span className="text-xs font-semibold text-gray-400">재검토 대상</span>
            </div>
            {/* 우상단: 안정적 공급자 */}
            <div className="flex items-end justify-end p-3">
              <span className="text-xs font-semibold text-gray-400">안정적 공급자</span>
            </div>
          </div>

          {/* 중앙 십자선 */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300 z-10" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 z-10" />

          {/* 업체 포지션 점들 */}
          {positioningData.positions.map((pos, idx) => (
            <div
              key={idx}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${pos.x}%`,
                top: `${100 - pos.y}%`,
              }}
            >
              <div
                className={`rounded-full transition-all ${
                  pos.isCurrent
                    ? 'w-5 h-5 shadow-lg'
                    : 'w-3 h-3 bg-gray-400 hover:bg-gray-600'
                }`}
                style={pos.isCurrent ? { backgroundColor: '#0085FF' } : {}}
              />
              {/* 툴팁 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {pos.name}
                  <div className="text-gray-300">점수: {pos.score.toFixed(1)}</div>
                </div>
              </div>
            </div>
          ))}

          {/* 축 레이블 */}
          <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-gray-600 font-medium">
            안정성 점수 →
          </div>
          <div className="absolute -left-16 top-0 bottom-0 flex items-center">
            <span className="text-xs text-gray-600 font-medium transform -rotate-90 whitespace-nowrap">
              지속가능성 점수 →
            </span>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#0085FF' }}></div>
            <span className="font-semibold">{evaluation.supplier_name}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span>기타 업체</span>
          </div>
        </div>
      </div>

      {/* 전체 포지션 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
        <div className="flex items-start">
          <svg className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0" fill="#0085FF" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">현재 위치: {analysis.overallPosition}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.insight}</p>
          </div>
        </div>
      </div>

      {/* 강점과 개선점 */}
      {(analysis.strengths.length > 0 || analysis.improvements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {analysis.strengths.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="#0085FF" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                상대적 강점
              </h4>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700">• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.improvements.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                개선 필요 영역
              </h4>
              <ul className="space-y-1">
                {analysis.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-gray-700">• {improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 벤치마킹 테이블 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">세부 지표 비교</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평가 항목
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업체 점수
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리 평균
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리 최고
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리 내 순위
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평가
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysis.metrics.slice(0, 10).map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                    {metric.supplierScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                    {metric.groupAverage.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                    {metric.groupMax.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-xs text-gray-700">
                      <div className="font-medium">
                        {(metric.supplierScore - metric.groupAverage) >= 0 ? '+' : ''}{(metric.supplierScore - metric.groupAverage).toFixed(1)}점
                      </div>
                      <div className="text-gray-500">
                        {metric.rank}위/{metric.totalCount}개사
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                      {getStatusText(metric.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 레이더 차트 (간단한 시각화) */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">세부 지표 비교 막대차트</h3>
        <div className="space-y-3">
          {radarData.labels.slice(0, 6).map((label, index) => (
            <div key={index}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{label}</span>
                <span>
                  <span className="font-semibold text-gray-900">{radarData.supplierData[index].toFixed(0)}</span>
                  {' / '}
                  <span className="text-gray-500">{radarData.groupAverageData[index].toFixed(0)}</span>
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-4">
                {/* 그룹 평균 마커 */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-gray-400 z-10"
                  style={{ left: `${radarData.groupAverageData[index]}%` }}
                  title={`그룹 평균: ${radarData.groupAverageData[index].toFixed(0)}`}
                >
                  {/* 카테고리 평균 레이블 */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[10px] font-semibold text-white bg-gray-600 px-1.5 py-0.5 rounded shadow-sm">
                      카테고리 평균
                    </span>
                  </div>
                </div>
                {/* 업체 점수 바 */}
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(radarData.supplierData[index], 100)}%`,
                    backgroundColor: radarData.supplierData[index] >= radarData.groupAverageData[index] ? '#0085FF' : '#1f2937'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#0085FF' }}></div>
            <span>평균 이상</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-800 rounded mr-1"></div>
            <span>평균 미만</span>
          </div>
          <div className="flex items-center">
            <div className="w-1 h-3 bg-gray-400 mr-1"></div>
            <span>카테고리 평균</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkingSection;
