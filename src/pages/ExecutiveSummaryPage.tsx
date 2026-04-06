import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { EvaluationData } from '../types';

// 항목 ID → 한글명 매핑
const ITEM_LABELS: Record<string, string> = {
  performanceCount: '대외 수행실적 건수',
  performanceAmount: '대외 수행금액',
  adequatePersonnel: '적정 인력 보유',
  turnoverRate: '인력 이직율',
  safetyService: '안전한 서비스 제공',
  serviceQuality: 'Service Quality',
  directiveCompliance: '지시/권고사항 이행',
  emergencyResponse: '비상사태 대처능력',
  contractSupport: '계약관리 지원',
  regulationCompliance: '법 규제사항 준수',
  damagePrevention: '손해방지',
  qualityMgmt: '품질관리',
  claimFrequency: 'CLAIM 발생 빈도',
  quotationDelay: '견적불가/지연',
  specResponse: '단종/SPEC 불명확 대응',
  urgentResponse: '긴급/소량 발주 대응',
  deliveryMgmt: '납기관리',
  durability: '내구성/안정적 공급',
  timelyDelivery: '적시정량 납품',
  productVariety: '취급품목 다양성',
};

// 그룹별 최대 점수 (항목 ID → 만점)
const MAX_SCORES_AE: Record<string, number> = {
  performanceCount: 5, performanceAmount: 5, adequatePersonnel: 5, turnoverRate: 5,
  safetyService: 5, serviceQuality: 5, directiveCompliance: 5, emergencyResponse: 5,
  contractSupport: 5, regulationCompliance: 5, damagePrevention: 5,
};
const MAX_SCORES_BCG: Record<string, number> = {
  performanceCount: 5, performanceAmount: 5, qualityMgmt: 4, claimFrequency: 4,
  quotationDelay: 4, specResponse: 4, urgentResponse: 4, deliveryMgmt: 4,
  contractSupport: 4, regulationCompliance: 4, damagePrevention: 4,
  durability: 4, timelyDelivery: 4, productVariety: 4,
};

function getMaxScore(group: string, itemId: string): number {
  if (group === 'A' || group === 'E') return MAX_SCORES_AE[itemId] ?? 5;
  return MAX_SCORES_BCG[itemId] ?? 4;
}

// 그룹 표시명
const GROUP_NAMES: Record<string, string> = {
  A: 'Group A - 주요 외주용역',
  B: 'Group B - 자재 (정비, 운영)',
  C: 'Group C - 연료비 (유류 외)',
  D: 'Group D - 시설공사',
  E: 'Group E - 외주용역',
  E1: 'Group E1 - 외주용역(냉동모니터링, 시설관리)',
  E2: 'Group E2 - One-Stop Service(줄잡이)',
  E3: 'Group E3 - 임직원복지 용역',
  E4: 'Group E4 - 기타용역',
  G: 'Group G - 소모품/일반',
};

interface GroupSummary {
  groupKey: string;
  suppliers: EvaluationData[];
  topSupplier: EvaluationData | null;
  weakItems: { id: string; label: string; avgRatio: number }[];
}

function computeGroupSummaries(evaluations: EvaluationData[]): GroupSummary[] {
  // approved/pending 이고 pass=true 인 것만
  const valid = evaluations.filter(e => e.pass && (e.status === 'approved' || e.status === 'pending'));

  // 그룹별로 묶기 (E는 세부 그룹 무시하고 E로 통합)
  const groupMap: Record<string, EvaluationData[]> = {};
  valid.forEach(e => {
    const g = e.supplier_group === 'F' || e.supplier_group === 'H' ? 'G' : e.supplier_group;
    if (!groupMap[g]) groupMap[g] = [];
    groupMap[g].push(e);
  });

  const order = ['A', 'B', 'C', 'D', 'E', 'G'];
  return order
    .filter(g => groupMap[g] && groupMap[g].length > 0)
    .map(g => {
      const suppliers = groupMap[g];
      // 1위: final_score 기준
      const sorted = [...suppliers].sort((a, b) => b.final_score - a.final_score);
      const topSupplier = sorted[0] ?? null;

      // 미흡 항목 분석: sustainability_details.items 기준 평균 달성률 낮은 순
      const itemTotals: Record<string, { sum: number; count: number }> = {};
      suppliers.forEach(e => {
        const items = e.sustainability_details?.items ?? {};
        Object.entries(items).forEach(([id, score]) => {
          if (!itemTotals[id]) itemTotals[id] = { sum: 0, count: 0 };
          itemTotals[id].sum += Number(score);
          itemTotals[id].count += 1;
        });
      });

      const weakItems = Object.entries(itemTotals)
        .map(([id, { sum, count }]) => {
          const avg = sum / count;
          const max = getMaxScore(g, id);
          return { id, label: ITEM_LABELS[id] ?? id, avgRatio: avg / max };
        })
        .filter(item => item.avgRatio < 1)
        .sort((a, b) => a.avgRatio - b.avgRatio)
        .slice(0, 5);

      return { groupKey: g, suppliers, topSupplier, weakItems };
    });
}

const ExecutiveSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { evaluations } = useApp();

  const summaries = useMemo(() => computeGroupSummaries(evaluations), [evaluations]);

  const totalSuppliers = summaries.reduce((s, g) => s + g.suppliers.length, 0);
  const excellentCount = summaries.filter(g => g.topSupplier).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">공급업체 평가 요약</h1>
            <p className="mt-1 text-sm text-gray-500">C-Level Executive Summary · 그룹별 평가 결과 및 우수/승인 공급업체 현황</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50"
          >
            ← 대시보드
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="평가 그룹 수" value={`${summaries.length}개`} color="blue" />
          <KpiCard label="총 평가 업체" value={`${totalSuppliers}개`} color="indigo" />
          <KpiCard label="우수협력사" value={`${excellentCount}개`} color="green" />
          <KpiCard label="승인공급업체" value={`${totalSuppliers - excellentCount}개`} color="gray" />
        </div>

        {/* 그룹별 카드 */}
        {summaries.map(summary => (
          <GroupCard key={summary.groupKey} summary={summary} />
        ))}
      </main>
    </div>
  );
};

// KPI 카드
const KpiCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] ?? colors.gray}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
};

// 그룹 카드
const GroupCard: React.FC<{ summary: GroupSummary }> = ({ summary }) => {
  const { groupKey, suppliers, topSupplier, weakItems } = summary;
  const approved = suppliers.filter(e => e !== topSupplier);
  const avgScore = suppliers.reduce((s, e) => s + e.final_score, 0) / suppliers.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 그룹 헤더 */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mr-2">
            {groupKey}
          </span>
          <span className="text-base font-semibold text-gray-800">
            {GROUP_NAMES[groupKey] ?? groupKey}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          총 <span className="font-semibold text-gray-800">{suppliers.length}</span>개 업체 · 평균 점수{' '}
          <span className="font-semibold text-gray-800">{avgScore.toFixed(1)}점</span>
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-3 gap-6">
        {/* 우수협력사 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏆 우수협력사 (1위)</p>
          {topSupplier ? (
            <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
              <p className="font-bold text-gray-900 text-sm">{topSupplier.supplier_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">최종점수</p>
              <p className="text-2xl font-bold text-yellow-600">{topSupplier.final_score.toFixed(1)}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge color="green">안전 {topSupplier.safety_passed ? '통과' : '미통과'}</Badge>
                <Badge color="blue">지속가능 {topSupplier.sustainability_score.toFixed(0)}점</Badge>
                <Badge color="purple">재무 {topSupplier.stability_score.toFixed(0)}점</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">해당 없음</p>
          )}
        </div>

        {/* 승인공급업체 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            ✅ 승인공급업체 ({approved.length}개)
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {approved.length === 0 && <p className="text-sm text-gray-400">해당 없음</p>}
            {[...approved]
              .sort((a, b) => b.final_score - a.final_score)
              .map(e => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-800 truncate max-w-[160px]">{e.supplier_name}</span>
                  <span className="text-sm font-semibold text-gray-600 ml-2 shrink-0">{e.final_score.toFixed(1)}점</span>
                </div>
              ))}
          </div>
        </div>

        {/* 미흡 항목 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">⚠️ 그룹 내 미흡 항목 (하위 5개)</p>
          {weakItems.length === 0 ? (
            <p className="text-sm text-gray-400">미흡 항목 없음</p>
          ) : (
            <div className="space-y-2">
              {weakItems.map(item => (
                <div key={item.id}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-700 truncate max-w-[160px]">{item.label}</span>
                    <span className={`font-semibold ml-1 shrink-0 ${item.avgRatio < 0.6 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {(item.avgRatio * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${item.avgRatio < 0.6 ? 'bg-red-400' : 'bg-yellow-400'}`}
                      style={{ width: `${item.avgRatio * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[color] ?? ''}`}>
      {children}
    </span>
  );
};

export default ExecutiveSummaryPage;
