import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SupplierGroupManager, SupplierGroupOverride } from '../../utils/SupplierGroupManager';

const SupplierGroupEditor: React.FC = () => {
  const { suppliers, suppliersList } = useApp();
  const [overrides, setOverrides] = useState<SupplierGroupOverride[]>([]);
  const [searchText, setSearchText] = useState('');
  const [editingBusinessNumber, setEditingBusinessNumber] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    overrideGroup: string;
    subGroup: string;
  } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadOverrides();
  }, []);

  const loadOverrides = () => {
    const loaded = SupplierGroupManager.getGroupOverrides();
    setOverrides(loaded);
  };

  const groupCodes = SupplierGroupManager.getAllGroupCodes();

  // 필터링된 공급업체 목록
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      if (!searchText) return true;
      const searchLower = searchText.toLowerCase();
      return (
        s.rawData.company_name.toLowerCase().includes(searchLower) ||
        s.rawData.business_number.includes(searchLower)
      );
    });
  }, [suppliers, searchText]);

  const handleEdit = (businessNumber: string, companyName: string, originalGroup: string) => {
    const override = overrides.find(o => o.businessNumber === businessNumber);
    setEditingBusinessNumber(businessNumber);
    setEditForm({
      overrideGroup: override?.overrideGroup || originalGroup,
      subGroup: override?.subGroup || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingBusinessNumber(null);
    setEditForm(null);
  };

  const handleSaveEdit = (businessNumber: string, companyName: string, originalGroup: string) => {
    if (!editForm) return;

    try {
      const override: SupplierGroupOverride = {
        businessNumber,
        companyName,
        originalGroup,
        overrideGroup: editForm.overrideGroup,
        subGroup: editForm.subGroup,
      };

      SupplierGroupManager.setSupplierGroupOverride(override);
      loadOverrides();
      setEditingBusinessNumber(null);
      setEditForm(null);
      showMessage('success', '그룹 설정이 저장되었습니다.');
    } catch (error) {
      showMessage('error', '저장 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveOverride = (businessNumber: string) => {
    if (confirm('이 공급업체의 그룹 오버라이드를 삭제하시겠습니까?')) {
      SupplierGroupManager.removeSupplierGroupOverride(businessNumber);
      loadOverrides();
      showMessage('success', '그룹 오버라이드가 삭제되었습니다.');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const getSubGroupOptions = (groupCode: string): string[] => {
    return SupplierGroupManager.getSubGroupOptions(groupCode);
  };

  const getEffectiveGroup = (businessNumber: string, originalGroup: string): string => {
    const override = overrides.find(o => o.businessNumber === businessNumber);
    return override?.overrideGroup || originalGroup;
  };

  const getEffectiveSubGroup = (businessNumber: string): string => {
    const override = overrides.find(o => o.businessNumber === businessNumber);
    return override?.subGroup || '';
  };

  const handleDownloadCSV = () => {
    // CSV 헤더
    const headers = ['사업자번호', '회사명', '원본그룹', '적용그룹', '세부그룹'];
    
    // CSV 데이터 생성
    const rows = suppliers.map(supplier => {
      const businessNumber = supplier.rawData.business_number;
      const companyName = supplier.rawData.company_name;
      const supplierListData = suppliersList.find(s => s.business_number === businessNumber);
      const originalGroup = supplierListData?.supplier_group || '';
      const effectiveGroup = getEffectiveGroup(businessNumber, originalGroup);
      const effectiveSubGroup = getEffectiveSubGroup(businessNumber);
      
      return [
        businessNumber,
        companyName,
        originalGroup,
        effectiveGroup,
        effectiveSubGroup
      ];
    });

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // BOM 추가 (Excel에서 한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `supplier-groups-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('success', 'CSV 파일이 다운로드되었습니다.');
  };

  const handleUploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // 헤더 제거
        const dataLines = lines.slice(1);
        
        let successCount = 0;
        let errorCount = 0;

        dataLines.forEach(line => {
          // CSV 파싱 (따옴표 처리)
          const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
          if (!matches || matches.length < 5) return;

          const [businessNumber, companyName, originalGroup, overrideGroup, subGroup] = matches.map(
            cell => cell.replace(/^"|"$/g, '').trim()
          );

          if (!businessNumber) return;

          // 원본 그룹 찾기
          const supplierListData = suppliersList.find(s => s.business_number === businessNumber);
          const actualOriginalGroup = supplierListData?.supplier_group || originalGroup;

          // 그룹이 변경되었거나 세부 그룹이 있는 경우에만 저장
          if (overrideGroup !== actualOriginalGroup || subGroup) {
            try {
              const override: SupplierGroupOverride = {
                businessNumber,
                companyName,
                originalGroup: actualOriginalGroup,
                overrideGroup: overrideGroup || actualOriginalGroup,
                subGroup: subGroup || '',
              };
              SupplierGroupManager.setSupplierGroupOverride(override);
              successCount++;
            } catch (error) {
              errorCount++;
            }
          }
        });

        loadOverrides();
        showMessage('success', `CSV 업로드 완료: ${successCount}개 성공, ${errorCount}개 실패`);
      } catch (error) {
        showMessage('error', 'CSV 파일 처리 중 오류가 발생했습니다.');
      }
    };

    reader.readAsText(file);
    // input 초기화 (같은 파일 재업로드 가능하도록)
    event.target.value = '';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">공급업체 그룹 분류 관리</h2>
          
          {/* CSV 다운로드/업로드 버튼 */}
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              CSV 다운로드
            </button>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              CSV 업로드
              <input
                type="file"
                accept=".csv"
                onChange={handleUploadCSV}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {/* 검색 */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="회사명 또는 사업자번호로 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회사명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사업자번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                원본 그룹
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                적용 그룹
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                세부 그룹
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.map((supplier) => {
              const businessNumber = supplier.rawData.business_number;
              const companyName = supplier.rawData.company_name;
              
              // suppliers CSV에서 원본 그룹 가져오기
              const supplierListData = suppliersList.find(s => s.business_number === businessNumber);
              const originalGroup = supplierListData?.supplier_group || '-';
              
              const isEditing = editingBusinessNumber === businessNumber;
              const hasOverride = overrides.some(o => o.businessNumber === businessNumber);

              return (
                <tr key={businessNumber} className={hasOverride ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{companyName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{businessNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{originalGroup}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editForm?.overrideGroup || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm!, overrideGroup: e.target.value, subGroup: '' })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        {groupCodes.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">
                        {getEffectiveGroup(businessNumber, originalGroup)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      getSubGroupOptions(editForm?.overrideGroup || '').length > 0 ? (
                        <select
                          value={editForm?.subGroup || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm!, subGroup: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        >
                          <option value="">선택 안함</option>
                          {getSubGroupOptions(editForm?.overrideGroup || '').map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )
                    ) : (
                      <span className="text-sm text-gray-900">
                        {getEffectiveSubGroup(businessNumber) || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEditing ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSaveEdit(businessNumber, companyName, originalGroup)}
                          className="text-primary hover:text-primary-dark"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(businessNumber, companyName, originalGroup)}
                          className="text-primary hover:text-primary-dark"
                        >
                          수정
                        </button>
                        {hasOverride && (
                          <button
                            onClick={() => handleRemoveOverride(businessNumber)}
                            className="text-red-600 hover:text-red-900"
                          >
                            초기화
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>참고:</strong> 파란색 배경은 그룹이 수정된 공급업체입니다. 
          세부 그룹은 E그룹(E1-E4)과 G그룹(소모품/일반)에서만 선택할 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default SupplierGroupEditor;
