import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import TransactionDataManager from '../components/admin/TransactionDataManager';
import SupplierGroupEditor from '../components/admin/SupplierGroupEditor';
import { DataExporter } from '../utils/DataExporter';

type TabType = 'transaction' | 'groups';

const AdminPage: React.FC = () => {
  const { isAdmin, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('transaction');

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleExportData = () => {
    DataExporter.downloadAsJSON();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
              <p className="text-sm text-gray-500 mt-1">공급업체 데이터 관리</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleExportData}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                title="거래 데이터와 그룹 설정을 JSON 파일로 내보내기"
              >
                📥 데이터 내보내기
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                대시보드로
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('transaction')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'transaction'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                거래 데이터 관리
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'groups'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                공급업체 그룹 관리
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div>
          {activeTab === 'transaction' && <TransactionDataManager />}
          {activeTab === 'groups' && <SupplierGroupEditor />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
