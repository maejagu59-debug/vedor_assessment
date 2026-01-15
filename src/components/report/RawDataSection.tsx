import React, { useState } from 'react';
import { SupplierReport } from '../../types';

interface RawDataSectionProps {
  supplier: SupplierReport;
}

const RawDataSection: React.FC<RawDataSectionProps> = ({ supplier }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { rawData } = supplier;

  const dataEntries = Object.entries(rawData).map(([key, value]) => ({
    key,
    value: typeof value === 'number' ? value.toLocaleString() : String(value),
  }));

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-xl font-bold text-gray-900">원본 데이터</h3>
          <p className="mt-1 text-sm text-gray-500">
            보고서 생성에 사용된 원본 CSV 데이터
          </p>
        </div>
        <svg
          className={`w-6 h-6 text-gray-400 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    필드명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    값
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataEntries.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* JSON 형식으로도 표시 */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">JSON 형식</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawDataSection;
