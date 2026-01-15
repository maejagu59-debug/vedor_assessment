import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { CategoryRankCalculator } from '../../utils/CategoryRankCalculator';

type GroupType = 'A' | 'B' | 'C' | 'D' | 'E1' | 'E2' | 'E3' | 'E4' | 'G';

const SupplierTable: React.FC = () => {
  const { getFilteredSuppliers } = useApp();
  const navigate = useNavigate();
  const suppliers = getFilteredSuppliers();
  const [selectedGroup, setSelectedGroup] = useState<GroupType>('A');

  // 그룹별 순위 계산
  const rankings = useMemo(() => {
    return CategoryRankCalculator.calculateGroupRankings(suppliers);
  }, [suppliers]);

  const handleRowClick = (id: string) => {
    navigate(`/report/${id}`);
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'S':
        return 'bg-purple-100 text-purple-800';
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentGroupData = rankings[selectedGroup];

  if (suppliers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">공급업체 데이터 없음</h3>
          <p className="mt-1 text-sm text-gray-500">
            공급망 리스크, 데이터로 정확하게 예측하고 관리하세요.
          </p>
        </div>
      </div>
    );
  }

  if (currentGroupData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 그룹 탭 */}
        <div className="bg-white shadow rounded-lg mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex items-start space-x-4 px-6 overflow-x-auto" aria-label="Tabs">
              {(['A', 'B', 'C', 'D', 'E1', 'E2', 'E3', 'E4', 'G'] as GroupType[]).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`
                    whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors flex-shrink-0
                    ${selectedGroup === group
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex flex-col items-start min-h-[60px]">
                    <span className="font-semibold">{CategoryRankCalculator.getGroupName(group).split(' - ')[0]}</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {CategoryRankCalculator.getGroupName(group).split(' - ')[1]}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">해당 그룹에 평가 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 그룹 탭 */}
      <div className="bg-white shadow rounded-lg mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex items-start space-x-4 px-6 overflow-x-auto" aria-label="Tabs">
            {(['A', 'B', 'C', 'D', 'E1', 'E2', 'E3', 'E4', 'G'] as GroupType[]).map((group) => {
              const hasData = rankings[group].length > 0;
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`
                    whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors flex-shrink-0
                    ${selectedGroup === group
                      ? 'border-primary text-primary'
                      : hasData
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-300'
                    }
                  `}
                  title={hasData ? `${rankings[group].length}개 공급업체` : '데이터 없음'}
                >
                  <div className="flex flex-col items-start min-h-[60px]">
                    <span className="font-semibold">{CategoryRankCalculator.getGroupName(group).split(' - ')[0]}</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {CategoryRankCalculator.getGroupName(group).split(' - ')[1]}
                    </span>
                    {hasData && <span className="text-xs text-primary mt-1">({rankings[group].length}개사)</span>}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 그룹별 순위 테이블 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {CategoryRankCalculator.getGroupName(selectedGroup)} 순위
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200 table-fixed" style={{ width: '1200px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '80px' }}>
                  순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '200px' }}>
                  회사명
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '400px' }}>
                  주요 제품
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '120px' }}>
                  안전 등급
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ width: '150px' }}>
                  최종 변환점수
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGroupData.map((rankData) => {
                return (
                  <tr
                    key={rankData.supplierId}
                    onClick={() => handleRowClick(rankData.supplierId)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center" style={{ width: '80px' }}>
                      <div className="flex items-center justify-center">
                        {rankData.rank <= 3 ? (
                          <span className={`
                            inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white
                            ${rankData.rank === 1 ? 'bg-yellow-500' : ''}
                            ${rankData.rank === 2 ? 'bg-gray-400' : ''}
                            ${rankData.rank === 3 ? 'bg-orange-600' : ''}
                          `}>
                            {rankData.rank}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            {rankData.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden" style={{ width: '200px' }}>
                      <div className="text-sm font-medium text-gray-900 font-bold truncate">
                        {rankData.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 overflow-hidden" style={{ width: '400px' }}>
                      <div className="text-sm font-medium text-gray-900 font-bold truncate" title={rankData.mainProducts}>
                        {rankData.mainProducts}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center" style={{ width: '120px' }}>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${getGradeBadgeColor(
                          rankData.safetyGrade
                        )}`}
                      >
                        {rankData.safetyGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center" style={{ width: '150px' }}>
                      <span className="text-sm font-bold text-gray-900">
                        {rankData.finalConvertedScore.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-700 font-bold">
            총 <span className="font-bold">{currentGroupData.length}</span>개 공급업체
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierTable;
