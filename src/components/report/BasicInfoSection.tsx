import React from 'react';
import { SupplierReport } from '../../types';

interface BasicInfoSectionProps {
  supplier: SupplierReport;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ supplier }) => {
  const { rawData, analysis } = supplier;

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-gray-900 text-white border-gray-900';
      case 'B': return 'bg-gray-700 text-white border-gray-700';
      case 'C': return 'bg-gray-400 text-white border-gray-400';
      case 'D': return 'bg-gray-200 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-success text-white';
      case 'MEDIUM': return 'bg-warning text-white';
      case 'HIGH': return 'bg-danger text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const infoItems = [
    { label: '대표자', value: rawData.ceo_name },
    { label: '설립일', value: rawData.establishment_date || '-' },
    { label: '웹사이트', value: rawData.website || '-', isLink: true },
    { label: '주요 제품/서비스', value: rawData.main_products_services || '-' },
    { label: '사업자번호', value: rawData.business_number || '-' },
    { label: '본사 주소', value: rawData.hq_address || '-' },
    { label: 'BCT 담당자', value: rawData.bct_contact_name || '-' },
    { label: 'BCT 담당자 연락처', value: rawData.bct_contact_phone || '-' },
    { label: 'BCT 담당자 이메일', value: rawData.bct_contact_email || '-' },
  ];

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{rawData.company_name}</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">기업 기본 정보 및 평가 결과</p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full border ${getGradeBadgeColor(
              rawData.safety_questionnaire_grade
            )}`}
          >
            안전 등급: {rawData.safety_questionnaire_grade}
          </span>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${getRiskBadgeColor(
              analysis.riskLevel
            )}`}
          >
            리스크: {analysis.riskLevel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoItems.map((item, index) => (
          <div key={index} className="pl-4 smooth-transition hover:pl-5" style={{ borderLeft: '3px solid #0085FF' }}>
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</dt>
            <dd className="mt-2 text-sm text-gray-900 font-medium">
              {item.isLink && item.value !== '-' ? (
                <a
                  href={item.value.startsWith('http') ? item.value : `https://${item.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicInfoSection;
