import { EvaluationData } from '../types';
import { TransactionData } from './TransactionParser';
import { EvaluationScoreCalculator } from './EvaluationScoreCalculator';

export interface EvaluationAnalysis {
  categoryDescription: string;
  supplierPositioning: string; // 공급업체 포지셔닝 분석
  operationalRiskAssessment: string; // 운영 리스크 평가
  strategicRecommendation: string; // 전략적 제언
  keyPerformanceInsights: string; // 핵심 성과 인사이트
  transactionAnalysis?: string; // 거래 데이터 분석 (선택적)
}

export class EvaluationAnalyzer {
  /**
   * 카테고리별 설명 (구매·공급망 리스크 관점)
   */
  private static getCategoryDescription(group: string): string {
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
  }

  /**
   * 공급업체 포지셔닝 분석 (구매 전략 관점)
   */
  private static analyzeSupplierPositioning(evaluation: EvaluationData): string {
    const { supplier_group, final_score } = evaluation;
    const sustainabilityItems = evaluation.sustainability_details?.items || {};

    let positioning = '';

    // 1. 최종 점수 기반 등급 결정
    let gradeLevel: 'excellent' | 'good' | 'conditional' | 'high-risk';
    let gradeLabel: string;
    
    if (final_score >= 90) {
      gradeLevel = 'excellent';
      gradeLabel = '우수 협력사';
    } else if (final_score >= 80) {
      gradeLevel = 'good';
      gradeLabel = '준수한 협력사';
    } else if (final_score >= 60) {
      gradeLevel = 'conditional';
      gradeLabel = '승인 공급업체';
    } else {
      gradeLevel = 'high-risk';
      gradeLabel = '제외 대상';
    }

    // 2. 카테고리별 전략적 중요도 및 역량 평가
    if (supplier_group === 'E') {
      positioning += '【전략적 중요도: 높음】 본 업체는 터미널 안전 운영의 핵심 파트너로서, ';
      const safetyMetrics = [
        sustainabilityItems.damagePrevention,
        sustainabilityItems.emergencyResponse,
        sustainabilityItems.regulationCompliance
      ].filter(v => v !== undefined);
      
      const avgSafety = safetyMetrics.length > 0 
        ? safetyMetrics.reduce((a: number, b: number) => a + b, 0) / safetyMetrics.length 
        : 0;
      
      if (avgSafety >= 4.5) {
        positioning += '사고 예방, 비상 대응, 법규 준수 측면에서 우수한 역량을 보유하고 있어 터미널 안전 문화 구축에 핵심적인 역할을 수행할 수 있습니다. ';
      } else if (avgSafety >= 3.5) {
        positioning += '기본적인 안전 관리 역량을 갖추고 있으나, 사고 예방 및 비상 대응 체계의 고도화가 필요합니다. ';
      } else {
        positioning += '안전 관리 역량이 터미널 운영 기준에 미달하여 즉각적인 개선이 요구됩니다. ';
      }
    } else if (supplier_group === 'B' || supplier_group === 'C') {
      positioning += '【전략적 중요도: 높음】 본 업체는 터미널 가동률에 직접적인 영향을 미치는 핵심 공급업체로서, ';
      
      const supplyChainMetrics = {
        delivery: sustainabilityItems.deliveryMgmt || sustainabilityItems.timelyDelivery || 0,
        urgent: sustainabilityItems.urgentResponse || 0,
        quality: sustainabilityItems.qualityMgmt || sustainabilityItems.durability || 0,
      };
      
      if (supplyChainMetrics.delivery >= 4 && supplyChainMetrics.urgent >= 4) {
        positioning += '납기 관리와 긴급 대응 능력이 우수하여 터미널 운영 중단 리스크를 최소화할 수 있습니다. ';
      } else if (supplyChainMetrics.delivery <= 3 || supplyChainMetrics.urgent <= 3) {
        positioning += '납기 지연 및 긴급 대응 미흡으로 인한 터미널 가동률 저하 리스크가 존재합니다. ';
      }
      
      if (supplyChainMetrics.quality >= 4) {
        positioning += '품질 관리 체계가 안정적이어서 장비 고장으로 인한 운영 차질 가능성이 낮습니다. ';
      } else {
        positioning += '품질 불안정으로 인한 장비 고장 및 클레임 발생 가능성에 대한 모니터링이 필요합니다. ';
      }
    } else if (supplier_group === 'A' || supplier_group === 'D') {
      positioning += '【전략적 중요도: 높음】 본 업체는 터미널 운영 인프라를 담당하는 중요 협력업체로서, ';
      
      const performanceMetrics = {
        quality: sustainabilityItems.qualityMgmt || sustainabilityItems.serviceQuality || 0,
        contract: sustainabilityItems.contractSupport || 0,
        delivery: sustainabilityItems.deliveryMgmt || sustainabilityItems.timelyDelivery || 0,
      };
      
      if (performanceMetrics.quality >= 4 && performanceMetrics.contract >= 4) {
        positioning += '품질 관리와 계약 이행 능력이 우수하여 안정적인 운영 지원이 가능합니다. ';
      } else {
        positioning += '품질 및 계약 이행 수준 향상을 통한 운영 안정성 제고가 필요합니다. ';
      }
    } else {
      positioning += '【전략적 중요도: 중간】 본 업체는 터미널 운영 지원 서비스를 제공하는 협력업체로서, ';
      
      const serviceMetrics = {
        quality: sustainabilityItems.serviceQuality || 0,
        contract: sustainabilityItems.contractSupport || 0,
      };
      
      if (serviceMetrics.quality >= 4 && serviceMetrics.contract >= 4) {
        positioning += '서비스 품질과 계약 이행 능력이 우수하여 터미널 운영 환경 개선에 기여하고 있습니다. ';
      } else {
        positioning += '서비스 품질 향상을 통한 터미널 운영 효율성 제고가 필요합니다. ';
      }
    }

    // 3. 최종 점수 기반 공급업체 등급 및 전략 제시
    if (gradeLevel === 'excellent') {
      positioning += `최종 평가 점수 ${final_score.toFixed(1)}점으로 "${gradeLabel}" 등급에 해당하며, "전략적 파트너(Strategic Partner)"로 분류됩니다. 재무 안정성과 운영 역량이 모두 우수하여 장기 계약 및 협력 강화를 통한 상호 성장 전략이 적합합니다.`;
    } else if (gradeLevel === 'good') {
      positioning += `최종 평가 점수 ${final_score.toFixed(1)}점으로 "${gradeLabel}" 등급에 해당하며, "우선 공급업체(Preferred Supplier)"로 분류됩니다. 안정적인 협력이 가능하며, 정기 평가를 통한 성과 관리가 권장됩니다.`;
    } else if (gradeLevel === 'conditional') {
      positioning += `최종 평가 점수 ${final_score.toFixed(1)}점으로 "${gradeLabel}" 등급에 해당하며, "조건부 승인 공급업체(Conditional Supplier)"로 분류됩니다. 개선 계획 이행 모니터링과 함께 제한적 협력이 적절합니다.`;
    } else {
      positioning += `최종 평가 점수 ${final_score.toFixed(1)}점으로 "${gradeLabel}" 등급에 해당하며, "고위험 공급업체(High-Risk Supplier)"로 분류됩니다. 즉각적인 개선 조치 또는 대체 공급업체 발굴이 필요합니다.`;
    }

    return positioning;
  }

  /**
   * 운영 리스크 평가 (SCM 전문가 관점)
   */
  private static assessOperationalRisk(evaluation: EvaluationData): string {
    const { supplier_group } = evaluation;
    const stabilityItems = evaluation.stability_details || {};
    const sustainabilityItems = evaluation.sustainability_details?.items || {};

    let riskAssessment = '';

    // 1. 공급 중단 리스크
    riskAssessment += '【공급 중단 리스크】 ';
    
    const financialRisk = stabilityItems.liquidity || 0;
    const operationalRisk = sustainabilityItems.performanceAmount || sustainabilityItems.performanceCount || 0;
    
    if (financialRisk <= 2 || operationalRisk <= 2) {
      riskAssessment += '유동성 부족 또는 실적 규모 미흡으로 인한 공급 중단 리스크가 높습니다. 대체 공급업체 확보 및 안전재고 확대가 필요합니다. ';
    } else if (financialRisk >= 4 && operationalRisk >= 4) {
      riskAssessment += '재무 안정성과 공급 역량이 우수하여 공급 중단 리스크가 낮습니다. ';
    } else {
      riskAssessment += '공급 중단 리스크가 중간 수준이며, 정기적인 재무 상태 및 공급 능력 모니터링이 권장됩니다. ';
    }

    // 2. 품질 리스크
    riskAssessment += '【품질 리스크】 ';
    
    const qualityMetrics = {
      quality: sustainabilityItems.qualityMgmt || sustainabilityItems.durability || 0,
      claim: sustainabilityItems.claimFrequency || 0,
      spec: sustainabilityItems.specResponse || 0,
    };
    
    if (qualityMetrics.quality >= 4 && qualityMetrics.claim >= 4) {
      riskAssessment += '품질 관리 체계가 안정적이고 클레임 발생률이 낮아 품질 리스크가 낮습니다. ';
    } else if (qualityMetrics.quality <= 3 || qualityMetrics.claim <= 3) {
      riskAssessment += '품질 불안정 및 클레임 발생 가능성이 있어 입고 검사 강화 및 품질 개선 요구가 필요합니다. ';
    } else {
      riskAssessment += '품질 리스크가 중간 수준이며, 지속적인 품질 모니터링이 필요합니다. ';
    }

    // 3. 납기 리스크
    riskAssessment += '【납기 리스크】 ';
    
    const deliveryMetrics = {
      delivery: sustainabilityItems.deliveryMgmt || sustainabilityItems.timelyDelivery || 0,
      urgent: sustainabilityItems.urgentResponse || 0,
      quotation: sustainabilityItems.quotationDelay || 0,
    };
    
    if (deliveryMetrics.delivery >= 4 && deliveryMetrics.urgent >= 4) {
      riskAssessment += '정시 납품률이 높고 긴급 대응 능력이 우수하여 납기 리스크가 낮습니다. ';
    } else if (deliveryMetrics.delivery <= 3 || deliveryMetrics.urgent <= 3) {
      riskAssessment += '납기 지연 가능성이 있어 발주 리드타임 확대 및 진척 관리 강화가 필요합니다. ';
    } else {
      riskAssessment += '납기 리스크가 중간 수준이며, 주요 발주 건에 대한 납기 모니터링이 권장됩니다. ';
    }

    // 4. 안전/규정 준수 리스크 (E 카테고리 특화)
    if (supplier_group === 'E') {
      riskAssessment += '【안전 리스크】 ';
      
      const safetyMetrics = {
        damage: sustainabilityItems.damagePrevention || 0,
        emergency: sustainabilityItems.emergencyResponse || 0,
        regulation: sustainabilityItems.regulationCompliance || 0,
        directive: sustainabilityItems.directiveCompliance || 0,
      };
      
      const avgSafety = Object.values(safetyMetrics).filter(v => v > 0).reduce((a, b) => a + b, 0) / 
                        Object.values(safetyMetrics).filter(v => v > 0).length;
      
      if (avgSafety >= 4.5) {
        riskAssessment += '사고 예방, 비상 대응, 법규 준수 모든 측면에서 우수하여 안전 리스크가 매우 낮습니다. 터미널 안전 문화 향상의 모범 사례로 활용 가능합니다.';
      } else if (avgSafety >= 3.5) {
        riskAssessment += '기본적인 안전 관리는 이루어지고 있으나, 사고 예방 및 비상 대응 체계의 고도화가 필요합니다.';
      } else {
        riskAssessment += '안전 리스크가 높아 즉각적인 개선 조치가 필요하며, 개선 완료 전까지 작업 범위 제한 또는 감독 강화가 권장됩니다.';
      }
    }

    return riskAssessment;
  }

  /**
   * 핵심 성과 인사이트 (데이터 기반 분석)
   */
  private static generateKeyPerformanceInsights(evaluation: EvaluationData): string {
    const { supplier_group, final_score, stability_score, sustainability_score } = evaluation;
    const stabilityDetails = evaluation.stability_details || {};
    const sustainabilityItems = evaluation.sustainability_details?.items || {};

    let insights = '';

    // 1. 성과 지표 분석
    const stabilityPercentage = (stability_score / 10) * 100;
    const sustainabilityPercentage = (sustainability_score / 90) * 100;
    
    insights += `【성과 지표 분석】 안정성 ${stabilityPercentage.toFixed(1)}% (${stability_score}/10점), 지속가능성 ${sustainabilityPercentage.toFixed(1)}% (${sustainability_score}/90점)로 평가되었습니다. `;

    // 2. 강점 영역 식별
    const allScores: Array<{ area: string; score: number; category: string }> = [];
    
    // 안정성 항목
    Object.entries(stabilityDetails).forEach(([key, value]) => {
      if (key !== 'conversion' && key !== 'totalScore') {
        const labels: Record<string, string> = {
          debt: '부채 관리',
          equity: '자기자본',
          expertise: '전문성',
          liquidity: '유동성',
        };
        allScores.push({ area: labels[key] || key, score: Number(value), category: '안정성' });
      }
    });
    
    // 지속가능성 항목
    Object.entries(sustainabilityItems).forEach(([key, value]) => {
      const labels: Record<string, string> = {
        adequatePersonnel: '인력 배치',
        contractSupport: '계약 이행',
        damagePrevention: '사고 예방',
        directiveCompliance: '지침 준수',
        emergencyResponse: '비상 대응',
        performanceAmount: '실적 규모',
        performanceCount: '실적 건수',
        regulationCompliance: '법규 준수',
        safetyService: '안전 서비스',
        serviceQuality: '서비스 품질',
        turnoverRate: '이직률 관리',
        claimFrequency: '클레임 관리',
        deliveryMgmt: '납기 관리',
        durability: '내구성',
        productVariety: '제품 다양성',
        qualityMgmt: '품질 관리',
        quotationDelay: '견적 대응',
        specResponse: '사양 대응',
        timelyDelivery: '정시 납품',
        urgentResponse: '긴급 대응',
      };
      allScores.push({ area: labels[key] || key, score: Number(value), category: '지속가능성' });
    });

    // 상위 3개 강점
    const topPerformers = allScores.filter(s => s.score >= 5).sort((a, b) => b.score - a.score).slice(0, 3);
    if (topPerformers.length > 0) {
      insights += `특히 ${topPerformers.map(p => `${p.area}(${p.score}점)`).join(', ')} 영역에서 우수한 성과를 보이고 있어, `;
      
      if (supplier_group === 'E') {
        insights += '터미널 안전 운영의 신뢰할 수 있는 파트너로 평가됩니다. ';
      } else if (supplier_group === 'B' || supplier_group === 'C') {
        insights += '안정적인 공급망 운영에 기여할 수 있는 역량을 갖추고 있습니다. ';
      } else {
        insights += '터미널 운영 지원에 긍정적인 기여가 예상됩니다. ';
      }
    }

    // 3. 개선 필요 영역
    const weakPerformers = allScores.filter(s => s.score <= 2).sort((a, b) => a.score - b.score).slice(0, 2);
    if (weakPerformers.length > 0) {
      insights += `【개선 필요 영역】 ${weakPerformers.map(p => `${p.area}(${p.score}점)`).join(', ')} 영역은 `;
      
      if (supplier_group === 'E') {
        insights += '터미널 안전 운영에 부정적 영향을 미칠 수 있어 즉각적인 개선 조치가 필요합니다. ';
      } else if (supplier_group === 'B' || supplier_group === 'C') {
        insights += '공급 안정성에 리스크 요인으로 작용할 수 있어 개선 계획 수립이 필요합니다. ';
      } else {
        insights += '서비스 품질 향상을 위한 개선이 필요합니다. ';
      }
      
      insights += '개선 목표 설정 및 분기별 진척 모니터링을 권장합니다.';
    } else if (final_score >= 90) {
      insights += '전반적으로 우수한 성과를 보이고 있어 현재 수준을 유지하면서 지속적인 개선 활동을 통해 업계 선도 업체로 발전할 수 있는 잠재력을 보유하고 있습니다.';
    }

    return insights;
  }

  /**
   * 전략적 제언 (구매 전략 수립)
   */
  private static generateStrategicRecommendation(evaluation: EvaluationData): string {
    const { supplier_group, final_score, pass, stability_score, sustainability_score } = evaluation;
    const stabilityPercentage = (stability_score / 10) * 100;
    const sustainabilityPercentage = (sustainability_score / 90) * 100;

    let recommendation = '';

    // 1. 계약 전략
    recommendation += '【계약 전략】 ';
    
    if (pass && final_score >= 95) {
      recommendation += '장기 계약(3년 이상) 체결을 통한 전략적 파트너십 구축이 적합합니다. 가격 협상보다는 협력 강화 및 공동 개선 활동에 초점을 맞추는 것이 권장됩니다. ';
    } else if (pass && final_score >= 85) {
      recommendation += '중기 계약(1-2년) 체결이 적합하며, 성과 기반 인센티브 조항을 포함하여 지속적인 품질 향상을 유도하는 것이 권장됩니다. ';
    } else if (pass) {
      recommendation += '단기 계약(6개월-1년) 또는 건별 계약이 적합하며, 개선 목표 달성 시 계약 기간 연장을 검토하는 조건부 계약이 권장됩니다. ';
    } else {
      recommendation += '현재 상태로는 계약 체결이 부적절하며, 개선 계획 수립 및 이행 후 재평가를 통해 계약 가능 여부를 판단해야 합니다. ';
    }

    // 2. 공급업체 관리 전략
    recommendation += '【관리 전략】 ';
    
    if (stabilityPercentage >= 80 && sustainabilityPercentage >= 85) {
      recommendation += '분기별 정기 평가 및 연간 전략 회의를 통한 협력 관계 강화가 권장됩니다. 우수 사례 공유 및 공동 혁신 프로젝트 추진을 고려할 수 있습니다. ';
    } else if (stabilityPercentage >= 60 && sustainabilityPercentage >= 65) {
      recommendation += '월별 성과 모니터링 및 분기별 개선 회의를 통한 지속적인 관리가 필요합니다. 주요 KPI 설정 및 목표 달성 여부를 추적해야 합니다. ';
    } else {
      recommendation += '주간 단위 모니터링 및 월별 개선 진척 점검이 필요합니다. 개선 미흡 시 계약 해지 또는 대체 공급업체 전환을 검토해야 합니다. ';
    }

    // 3. 카테고리별 특화 전략
    if (supplier_group === 'E') {
      recommendation += '【안전 관리 특화 전략】 ';
      if (final_score >= 90) {
        recommendation += '터미널 안전 문화 향상을 위한 모범 사례로 활용하고, 다른 안전 업체 평가 시 벤치마크 기준으로 설정할 것을 권장합니다. 안전 교육 프로그램 공동 개발 및 사고 예방 활동 협력을 통해 터미널 전체의 안전 수준을 향상시킬 수 있습니다.';
      } else if (final_score >= 70) {
        recommendation += '안전 관리 체계 고도화를 위한 개선 계획 수립이 필요하며, 분기별 안전 점검 및 교육 이수 현황 모니터링을 강화해야 합니다.';
      } else {
        recommendation += '안전 리스크가 높아 즉각적인 개선 조치가 필요하며, 개선 완료 전까지 작업 범위 제한 또는 타 업체와의 공동 작업을 통한 리스크 완화가 필요합니다.';
      }
    } else if (supplier_group === 'B' || supplier_group === 'C') {
      recommendation += '【공급망 관리 특화 전략】 ';
      if (final_score >= 90) {
        recommendation += 'VMI(Vendor Managed Inventory) 도입을 통한 재고 최적화 및 JIT(Just-In-Time) 공급 체계 구축을 검토할 수 있습니다. 장기 공급 계약 체결 시 물량 보장 및 가격 안정화를 통해 상호 이익을 극대화할 수 있습니다.';
      } else if (final_score >= 70) {
        recommendation += '안전재고 확보 및 대체 공급업체 발굴을 병행하면서 납기 관리 및 품질 개선을 지속적으로 모니터링해야 합니다.';
      } else {
        recommendation += '공급 중단 리스크가 높아 즉시 대체 공급업체를 확보하고, 현 업체는 보조 공급업체로 전환하거나 계약 해지를 검토해야 합니다.';
      }
    } else if (supplier_group === 'G') {
      recommendation += '【용역 관리 특화 전략】 ';
      if (final_score >= 85) {
        recommendation += '서비스 품질이 우수하여 장기 계약 체결이 가능하며, 서비스 범위 확대를 통한 운영 효율성 향상을 검토할 수 있습니다.';
      } else {
        recommendation += '서비스 품질 개선을 위한 KPI 설정 및 정기 평가를 통해 관리하며, 개선 미흡 시 경쟁 입찰을 통한 업체 교체를 검토해야 합니다.';
      }
    }

    return recommendation;
  }

  /**
   * 거래 데이터 분석 (표준화 점수 포함)
   */
  private static analyzeTransactionData(
    evaluation: EvaluationData,
    allEvaluations: EvaluationData[],
    transaction?: TransactionData
  ): string {
    if (!transaction) {
      return '【거래 데이터 없음】 본 공급업체의 거래 이력 데이터가 확인되지 않아 거래 규모 기반 분석이 제한됩니다. 신규 공급업체이거나 거래 실적이 미미한 것으로 판단됩니다.';
    }

    let analysis = '';

    // 1. 거래 규모 분석
    const monthlyAmount = transaction.transaction_amount / (transaction.months || 1);
    const monthlyCount = transaction.transaction_count / (transaction.months || 1);
    const amountInManWon = monthlyAmount / 10000;

    analysis += `【거래 규모 분석】 최근 ${transaction.months}개월간 총 거래금액 ${(transaction.transaction_amount / 100000000).toFixed(2)}억원, 거래횟수 ${transaction.transaction_count}건으로 월평균 ${amountInManWon.toFixed(0)}만원, ${monthlyCount.toFixed(1)}건의 거래가 발생했습니다. `;

    // 2. 공급업체 중요도 평가
    const importance = EvaluationScoreCalculator.calculateSupplierImportance(transaction);
    analysis += `이는 "${importance.level}" 등급에 해당하며, ${importance.description}입니다. `;

    // 3. 표준화 점수 계산
    const scoreAnalysis = EvaluationScoreCalculator.applyStandardizedScoring(
      evaluation,
      allEvaluations,
      transaction.transaction_amount,
      transaction.transaction_count
    );

    analysis += `【표준화 점수 분석】 원점수 ${scoreAnalysis.rawScore.toFixed(1)}점에서 카테고리 표준화(평균: ${scoreAnalysis.categoryMean.toFixed(1)}, 표준편차: ${scoreAnalysis.categoryStdDev.toFixed(2)}, 가중치: ${scoreAnalysis.categoryWeight})와 거래 데이터(영향도: ${scoreAnalysis.adjustmentScore.toFixed(2)})를 반영한 최종 변환점수는 ${scoreAnalysis.finalConvertedScore.toFixed(2)}점입니다. `;

    // 4. 거래 패턴 분석
    if (monthlyCount >= 20) {
      analysis += '높은 거래 빈도는 터미널 운영에 필수적인 소모품이나 서비스를 제공하는 것으로 판단되며, 공급 중단 시 즉각적인 운영 차질이 예상됩니다. ';
    } else if (monthlyCount >= 5) {
      analysis += '정기적인 거래 패턴은 안정적인 공급 관계를 나타내며, 계획적인 발주 관리가 가능합니다. ';
    } else {
      analysis += '낮은 거래 빈도는 비정기적 수요나 특수 품목 공급을 의미하며, 대체 공급업체 확보가 상대적으로 용이합니다. ';
    }

    // 5. 거래 금액 기반 협상력 분석
    if (amountInManWon >= 5000) {
      analysis += '【협상력 분석】 매우 높은 거래 규모로 인해 공급업체의 협상력이 강할 수 있으나, 장기 계약을 통한 가격 안정화 및 우선 공급 조건 확보가 가능합니다. 전략적 파트너십 구축을 통해 상호 이익을 극대화하는 것이 권장됩니다.';
    } else if (amountInManWon >= 1000) {
      analysis += '【협상력 분석】 상당한 거래 규모로 인해 가격 협상 및 서비스 개선 요구가 가능하며, 성과 기반 인센티브 조항을 통한 품질 향상 유도가 효과적입니다.';
    } else if (amountInManWon >= 100) {
      analysis += '【협상력 분석】 중간 수준의 거래 규모로 표준 계약 조건 적용이 적절하며, 경쟁 입찰을 통한 가격 경쟁력 확보가 가능합니다.';
    } else {
      analysis += '【협상력 분석】 소규모 거래로 인해 구매자 우위의 협상이 가능하나, 과도한 가격 압박은 품질 저하로 이어질 수 있어 적정 수준의 가격 유지가 필요합니다.';
    }

    return analysis;
  }

  /**
   * 평가 데이터 종합 분석
   */
  static analyzeEvaluation(
    evaluation: EvaluationData,
    allEvaluations?: EvaluationData[],
    transaction?: TransactionData
  ): EvaluationAnalysis {
    const evals = allEvaluations || [evaluation];
    
    return {
      categoryDescription: this.getCategoryDescription(
        (evaluation.supplier_group === 'E' && evaluation.detail_group) 
          ? evaluation.detail_group 
          : evaluation.supplier_group
      ),
      supplierPositioning: this.analyzeSupplierPositioning(evaluation),
      operationalRiskAssessment: this.assessOperationalRisk(evaluation),
      keyPerformanceInsights: this.generateKeyPerformanceInsights(evaluation),
      strategicRecommendation: this.generateStrategicRecommendation(evaluation),
      transactionAnalysis: transaction ? this.analyzeTransactionData(evaluation, evals, transaction) : undefined,
    };
  }
}
