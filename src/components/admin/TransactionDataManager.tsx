import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { SuppliersParser, SupplierListData } from '../../utils/SuppliersParser';

interface TransactionRow {
  supplier_id: string;
  supplier_name: string;
  supplier_group: string;
  business_number: string;
  department: string;
  transaction_amount: number; // 억원
  transaction_count: number; // 회
}

const TransactionDataManager: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useApp();
  const [suppliersList, setSuppliersList] = useState<SupplierListData[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('');
  const suppliersFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 저장된 suppliers 목록 로드
    const stored = localStorage.getItem('suppliers_list');
    if (stored) {
      try {
        const parsed: SupplierListData[] = JSON.parse(stored);
        setSuppliersList(parsed);
        loadTransactionData(parsed);
      } catch (error) {
        console.error('Suppliers 목록 로드 실패:', error);
      }
    }
  }, []);

  const handleSuppliersFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const parsed = await SuppliersParser.parseFile(file);
      setSuppliersList(parsed);
      localStorage.setItem('suppliers_list', JSON.stringify(parsed));
      loadTransactionData(parsed);
      alert(`${parsed.length}개의 공급업체 목록을 불러왔습니다.`);
    } catch (error) {
      console.error('Suppliers 파일 파싱 오류:', error);
      alert('Suppliers 파일 파싱 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      if (suppliersFileInputRef.current) {
        suppliersFileInputRef.current.value = '';
      }
    }
  };

  const loadTransactionData = (suppliers: SupplierListData[]) => {
    const data: TransactionRow[] = suppliers.map(supplier => {
      // 사업자등록번호를 키로 사용
      const storageKey = `transaction_data_${supplier.business_number}`;
      const stored = localStorage.getItem(storageKey);
      
      let amount = 0;
      let count = 0;
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          amount = parsed.transaction_amount || 0;
          count = parsed.transaction_count || 0;
        } catch (error) {
          console.error('데이터 파싱 오류:', error);
        }
      }

      return {
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_group: supplier.supplier_group,
        business_number: supplier.business_number,
        department: supplier.department,
        transaction_amount: amount,
        transaction_count: count,
      };
    });

    setTransactionData(data);
  };

  const handleAmountChange = (supplierId: string, value: string) => {
    setTransactionData(prev =>
      prev.map(row =>
        row.supplier_id === supplierId
          ? { ...row, transaction_amount: parseFloat(value) || 0 }
          : row
      )
    );
  };

  const handleCountChange = (supplierId: string, value: string) => {
    setTransactionData(prev =>
      prev.map(row =>
        row.supplier_id === supplierId
          ? { ...row, transaction_count: parseInt(value) || 0 }
          : row
      )
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      transactionData.forEach(row => {
        // 사업자등록번호를 키로 사용
        const storageKey = `transaction_data_${row.business_number}`;
        const data = {
          supplier_id: row.supplier_id,
          business_number: row.business_number,
          transaction_amount: row.transaction_amount,
          transaction_count: row.transaction_count,
          updated_at: new Date().toISOString(),
          updated_by: '관리자',
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
      });

      alert('모든 거래 데이터가 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['공급업체명', '사업자번호', '카테고리', '부서', '거래금액(억원)', '거래횟수(회)'];
    const rows = filteredData.map(row => [
      row.supplier_name,
      row.business_number,
      row.supplier_group,
      row.department,
      row.transaction_amount.toFixed(2),
      row.transaction_count.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `거래데이터_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(1); // 헤더 제외

        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 6) {
            const [name, businessNumber, , , amount, count] = parts;
            if (name && businessNumber) {
              const supplier = transactionData.find(
                s => s.business_number === businessNumber.trim()
              );
              if (supplier) {
                handleAmountChange(supplier.supplier_id, amount.trim());
                handleCountChange(supplier.supplier_id, count.trim());
              }
            }
          }
        });

        alert('CSV 파일을 불러왔습니다. "전체 저장" 버튼을 클릭하여 저장하세요.');
      } catch (error) {
        console.error('CSV 파싱 오류:', error);
        alert('CSV 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
  };

  // 필터링된 데이터
  const filteredData = transactionData.filter(row => {
    const matchesSearch = row.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         row.business_number.includes(searchTerm);
    const matchesGroup = !filterGroup || row.supplier_group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  // 카테고리 목록
  const categories = Array.from(new Set(transactionData.map(row => row.supplier_group))).sort();

  // 통계
  const totalAmount = filteredData.reduce((sum, row) => sum + row.transaction_amount, 0);
  const totalCount = filteredData.reduce((sum, row) => sum + row.transaction_count, 0);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            대시보드로 돌아가기
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">거래 데이터 일괄 관리</h2>
            <p className="mt-1 text-sm text-gray-600">
              공급업체별 거래금액과 거래횟수를 입력하여 평가 점수를 계산합니다.
            </p>
          </div>

        {/* 도구 모음 */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          {/* Suppliers 파일 업로드 */}
          {suppliersList.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                먼저 suppliers-export CSV 파일을 업로드하여 평가 대상 공급업체 목록을 불러오세요.
              </p>
              <input
                ref={suppliersFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleSuppliersFileUpload}
                className="hidden"
              />
              <button
                onClick={() => suppliersFileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {isLoading ? '처리 중...' : 'Suppliers CSV 업로드'}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {/* 검색 */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="공급업체명 또는 사업자번호 검색..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 카테고리 필터 */}
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 카테고리</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* CSV 가져오기 */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                CSV 가져오기
              </span>
            </label>

            {/* CSV 내보내기 */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV 내보내기
            </button>

            {/* 전체 저장 */}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSaving ? '저장 중...' : '전체 저장'}
            </button>
          </div>

          {/* 통계 */}
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="text-gray-600">총 공급업체: </span>
              <span className="font-semibold text-gray-900">{filteredData.length}개</span>
            </div>
            <div>
              <span className="text-gray-600">총 거래금액: </span>
              <span className="font-semibold text-blue-600">{totalAmount.toFixed(2)}억원</span>
            </div>
            <div>
              <span className="text-gray-600">총 거래횟수: </span>
              <span className="font-semibold text-green-600">{totalCount.toLocaleString()}회</span>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        {suppliersList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공급업체명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사업자번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    부서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래금액 (억원)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래횟수 (회)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row) => (
                  <tr key={row.supplier_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.business_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {row.supplier_group}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={row.transaction_amount}
                        onChange={(e) => handleAmountChange(row.supplier_id, e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={row.transaction_count}
                        onChange={(e) => handleCountChange(row.supplier_id, e.target.value)}
                        step="1"
                        min="0"
                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Suppliers CSV 파일을 업로드하여 시작하세요.</p>
          </div>
        )}

        {filteredData.length === 0 && suppliersList.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDataManager;
