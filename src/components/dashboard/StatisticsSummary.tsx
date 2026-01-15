import React from 'react';
import { useApp } from '../../contexts/AppContext';

const StatisticsSummary: React.FC = () => {
  const { statistics } = useApp();

  const cards = [
    {
      title: '전체 공급업체',
      value: statistics.totalCount,
      suffix: '개',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      bgColor: 'bg-blue-500',
    },
    {
      title: '평균 안전 점수',
      value: statistics.averageSafetyScore.toFixed(1),
      suffix: '점',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      bgColor: 'bg-green-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {/* 주요 통계 카드 */}
        {cards.map((card, index) => (
          <div
            key={index}
            className="lg:col-span-2 bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3 text-white`}>
                  {card.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </div>
                      <div className="ml-2 text-sm text-gray-500">{card.suffix}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 등급 분포 카드 */}
        <div className="lg:col-span-2 bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-3">등급 분포</h3>
            <div className="grid grid-cols-5 gap-2">
              {(['S', 'A', 'B', 'C', 'D'] as const).map(grade => (
                <div key={grade} className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {statistics.gradeDistribution[grade]}
                  </div>
                  <div className="text-xs text-gray-500">{grade}등급</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSummary;
