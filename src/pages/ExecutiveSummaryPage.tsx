import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { EvaluationData } from '../types';
import { EvaluationScoreCalculator } from '../utils/EvaluationScoreCalculator';

// ─── 상수 ───────────────────────────────────────────────────────────────────

const ITEM_LABELS: Record<string, string> = {
  performanceCount: '대외 수행실적 건수', performanceAmount: '대외 수행금액',
  adequatePersonnel: '적정 인력 보유', turnoverRate: '인력 이직율',
  safetyService: '안전한 서비스 제공', serviceQuality: 'Service Quality',
  directiveCompliance: '지시/권고사항 이행', emergencyResponse: '비상사태 대처능력',
  contractSupport: '계약관리 지원', regulationCompliance: '법 규제사항 준수',
  damagePrevention: '손해방지', qualityMgmt: '품질관리',
  claimFrequency: 'CLAIM 발생 빈도', quotationDelay: '견적불가/지연',
  specResponse: '단종/SPEC 불명확 대응', urgentResponse: '긴급/소량 발주 대응',
  deliveryMgmt: '납기관리', durability: '내구성/안정적 공급',
  timelyDelivery: '적시정량 납품', productVariety: '취급품목 다양성',
};

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
  if (group === 'A' || group.startsWith('E')) return MAX_SCORES_AE[itemId] ?? 5;
  return MAX_SCORES_BCG[itemId] ?? 4;
}

const GROUP_NAMES: Record<string, string> = {
  A: 'Group A - 주요 외주용역',
  B: 'Group B - 자재 (정비, 운영)',
  C: 'Group C - 연료비 (유류 외)',
  D: 'Group D - 시설공사',
  E1: 'Group E1 - 외주용역(냉동모니터링, 시설관리)',
  E2: 'Group E2 - One-Stop Service(줄잡이)',
  E3: 'Group E3 - 임직원복지관련 용역',
  E4: 'Group E4 - 기타용역',
  G: 'Group G - 소모품/일반',
};

// 승인보류 업체 (회사명 기준)
const SUSPENDED_SUPPLIERS: { name: string; reason: string }[] = [
  { name: '(주)현대지게차종합건설', reason: '서비스 퀄리티 저하' },
  { name: '경남고속뉴부산관광', reason: '서비스 중도해지' },
  { name: '용신해운', reason: '중대재해 발생으로 인한 폐업' },
];

function isSuspended(supplierName: string): boolean {
  return SUSPENDED_SUPPLIERS.some(s => supplierName.includes(s.name) || s.name.includes(supplierName));
}

function getSuspendedReason(supplierName: string): string {
  const found = SUSPENDED_SUPPLIERS.find(s => supplierName.includes(s.name) || s.name.includes(supplierName));
  return found?.reason ?? '';
}

// 결재자 정보
const APPROVERS = [
  { title: 'IT팀장', name: '담당자' },
  { title: '장비팀장', name: '담당자' },
  { title: 'HSSE팀장', name: '담당자' },
  { title: '운영팀장', name: '담당자' },
  { title: '인사총무/\n경영지원팀장', name: '담당자' },
  { title: 'CFO', name: '담당자' },
  { title: '대표이사', name: '담당자' },
];

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface SupplierWithScore extends EvaluationData {
  finalConvertedScore: number;
}

interface GroupSummary {
  groupKey: string;
  suppliers: SupplierWithScore[];
  suspendedSuppliers: SupplierWithScore[];
  topSupplier: SupplierWithScore | null;
  weakItems: { id: string; label: string; avgRatio: number }[];
}

// ─── 데이터 처리 ─────────────────────────────────────────────────────────────

function getSubGroupKey(e: EvaluationData): string {
  if (e.supplier_group !== 'E') return e.supplier_group;
  // detail_group 또는 localStorage 오버라이드에서 E1~E4 확인
  if (e.detail_group && /^E[1-4]$/.test(e.detail_group)) return e.detail_group;
  try {
    const stored = localStorage.getItem('supplier_group_overrides');
    if (stored) {
      const overrides = JSON.parse(stored);
      const ov = overrides.find((o: any) => o.businessNumber === e.business_number);
      if (ov?.subGroup && /^E[1-4]$/.test(ov.subGroup)) return ov.subGroup;
    }
  } catch { /* ignore */ }
  return 'E1'; // 기본값
}

function computeFinalScore(e: EvaluationData, allEvals: EvaluationData[]): number {
  try {
    let transactionAmount = 0;
    let transactionCount = 0;
    const stored = localStorage.getItem(`transaction_data_${e.business_number}`);
    if (stored) {
      const d = JSON.parse(stored);
      transactionAmount = d.transaction_amount || 0;
      transactionCount = d.transaction_count || 0;
    }
    const result = EvaluationScoreCalculator.applyStandardizedScoring(
      e, allEvals, transactionAmount, transactionCount
    );
    return result.finalConvertedScore;
  } catch {
    return e.final_score;
  }
}

function computeGroupSummaries(evaluations: EvaluationData[]): GroupSummary[] {
  const valid = evaluations.filter(e => e.pass && (e.status === 'approved' || e.status === 'pending'));

  // 최종 변환점수 계산
  const withScores: SupplierWithScore[] = valid.map(e => ({
    ...e,
    finalConvertedScore: computeFinalScore(e, valid),
  }));

  // 그룹별 묶기 (E → E1~E4, F/H → G)
  const groupMap: Record<string, SupplierWithScore[]> = {};
  withScores.forEach(e => {
    let g = e.supplier_group === 'F' || e.supplier_group === 'H' ? 'G' : e.supplier_group;
    if (g === 'E') g = getSubGroupKey(e);
    if (!groupMap[g]) groupMap[g] = [];
    groupMap[g].push(e);
  });

  const order = ['A', 'B', 'C', 'D', 'E1', 'E2', 'E3', 'E4', 'G'];
  return order
    .filter(g => groupMap[g] && groupMap[g].length > 0)
    .map(g => {
      const all = groupMap[g];
      const suspended = all.filter(e => isSuspended(e.supplier_name));
      const active = all.filter(e => !isSuspended(e.supplier_name));

      const sorted = [...active].sort((a, b) => b.finalConvertedScore - a.finalConvertedScore);
      const topSupplier = sorted[0] ?? null;

      // 미흡 항목 (승인보류 제외)
      const itemTotals: Record<string, { sum: number; count: number }> = {};
      active.forEach(e => {
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

      return { groupKey: g, suppliers: active, suspendedSuppliers: suspended, topSupplier, weakItems };
    });
}

// ─── 결재 도장 컴포넌트 ───────────────────────────────────────────────────────

const ApprovalStamp: React.FC<{ title: string; approved?: boolean }> = ({ title, approved = true }) => (
  <div className="flex flex-col items-center">
    <div
      className={`relative w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center
        ${approved ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
    >
      {/* 도장 내부 십자선 */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-10 ${approved ? 'text-red-600' : 'text-gray-400'}`}>
        <div className="w-full h-px bg-current absolute" />
        <div className="h-full w-px bg-current absolute" />
      </div>
      <span className={`text-xs font-bold text-center leading-tight z-10 px-1 whitespace-pre-line ${approved ? 'text-red-700' : 'text-gray-400'}`}>
        {title}
      </span>
      {approved && (
        <span className="text-red-500 text-xs font-bold z-10">✓</span>
      )}
    </div>
    <span className="text-xs text-gray-500 mt-1">결재</span>
  </div>
);

const ApprovalSection: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">공급업체 평가 결과 보고</h2>
        <p className="text-sm text-gray-500 mt-0.5">2025년도 공급업체 정기 평가 결과를 아래와 같이 보고합니다.</p>
        <p className="text-xs text-gray-400 mt-1">결재일: 2025년 11월 25일</p>
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        {APPROVERS.map((approver) => (
          <ApprovalStamp key={approver.title} title={approver.title} approved />
        ))}
      </div>
    </div>
  </div>
);

// ─── KPI 카드 ────────────────────────────────────────────────────────────────

const KpiCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] ?? colors.gray}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
};

// ─── 그룹 카드 ───────────────────────────────────────────────────────────────

const GroupCard: React.FC<{ summary: GroupSummary }> = ({ summary }) => {
  const { groupKey, suppliers, suspendedSuppliers, topSupplier, weakItems } = summary;
  const approved = suppliers.filter(e => e !== topSupplier);
  const avgScore = suppliers.length > 0
    ? suppliers.reduce((s, e) => s + e.finalConvertedScore, 0) / suppliers.length
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mr-2">{groupKey}</span>
          <span className="text-base font-semibold text-gray-800">{GROUP_NAMES[groupKey] ?? groupKey}</span>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-3">
          <span>총 <span className="font-semibold text-gray-800">{suppliers.length + suspendedSuppliers.length}</span>개 업체</span>
          <span>평균 변환점수 <span className="font-semibold text-gray-800">{avgScore.toFixed(1)}점</span></span>
          {suspendedSuppliers.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              승인보류 {suspendedSuppliers.length}개
            </span>
          )}
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-3 gap-6">
        {/* 우수협력사 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏆 우수협력사 (1위)</p>
          {topSupplier ? (
            <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
              <p className="font-bold text-gray-900 text-sm">{topSupplier.supplier_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">최종 변환점수</p>
              <p className="text-2xl font-bold text-yellow-600">{topSupplier.finalConvertedScore.toFixed(2)}</p>
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

        {/* 승인공급업체 + 승인보류 */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            ✅ 승인공급업체 ({approved.length}개)
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {approved.length === 0 && <p className="text-sm text-gray-400">해당 없음</p>}
            {[...approved]
              .sort((a, b) => b.finalConvertedScore - a.finalConvertedScore)
              .map(e => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
                  <span className="text-sm text-gray-800 truncate max-w-[150px]">{e.supplier_name}</span>
                  <span className="text-sm font-semibold text-gray-600 ml-2 shrink-0">{e.finalConvertedScore.toFixed(1)}점</span>
                </div>
              ))}
          </div>
          {suspendedSuppliers.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-orange-600 mb-1.5">⏸ 승인보류 ({suspendedSuppliers.length}개)</p>
              <div className="space-y-1.5">
                {suspendedSuppliers.map(e => (
                  <div key={e.id} className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-800 font-medium truncate max-w-[140px]">{e.supplier_name}</span>
                      <span className="text-xs text-orange-500 ml-1 shrink-0">{e.finalConvertedScore.toFixed(1)}점</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-0.5">{getSuspendedReason(e.supplier_name)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

const ExecutiveSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { evaluations } = useApp();

  const summaries = useMemo(() => computeGroupSummaries(evaluations), [evaluations]);

  const totalActive = summaries.reduce((s, g) => s + g.suppliers.length, 0);
  const totalSuspended = summaries.reduce((s, g) => s + g.suspendedSuppliers.length, 0);
  const excellentCount = summaries.filter(g => g.topSupplier).length;

  return (
    <div className="min-h-screen bg-gray-50">
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
        {/* 결재 섹션 */}
        <ApprovalSection />

        {/* KPI 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard label="평가 그룹 수" value={`${summaries.length}개`} color="blue" />
          <KpiCard label="총 평가 업체" value={`${totalActive + totalSuspended}개`} color="indigo" />
          <KpiCard label="우수협력사" value={`${excellentCount}개`} color="green" />
          <KpiCard label="승인공급업체" value={`${totalActive - excellentCount}개`} color="gray" />
          <KpiCard label="승인보류" value={`${totalSuspended}개`} color="orange" />
        </div>

        {/* 그룹별 카드 */}
        {summaries.map(summary => (
          <GroupCard key={summary.groupKey} summary={summary} />
        ))}
      </main>
    </div>
  );
};

export default ExecutiveSummaryPage;
