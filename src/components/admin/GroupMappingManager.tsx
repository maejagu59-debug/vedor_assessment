import React, { useState, useEffect } from 'react';
import { SupplierGroupManager, SupplierGroupMapping } from '../../utils/SupplierGroupManager';

const GroupMappingManager: React.FC = () => {
  const [mappings, setMappings] = useState<SupplierGroupMapping[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SupplierGroupMapping | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = () => {
    const loaded = SupplierGroupManager.getGroupMappings();
    setMappings(loaded);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...mappings[index] });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editForm || editingIndex === null) return;

    const updatedMappings = [...mappings];
    updatedMappings[editingIndex] = editForm;

    try {
      SupplierGroupManager.saveGroupMappings(updatedMappings);
      setMappings(updatedMappings);
      setEditingIndex(null);
      setEditForm(null);
      showMessage('success', '그룹 매핑이 저장되었습니다.');
    } catch (error) {
      showMessage('error', '저장 중 오류가 발생했습니다.');
    }
  };

  const handleReset = () => {
    if (confirm('모든 그룹 매핑을 기본값으로 초기화하시겠습니까?')) {
      SupplierGroupManager.resetToDefault();
      loadMappings();
      showMessage('success', '기본값으로 초기화되었습니다.');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">공급업체 그룹 관리</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          기본값으로 초기화
        </button>
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
                그룹 코드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                표시명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mappings.map((mapping, index) => (
              <tr key={mapping.code}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{mapping.code}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editForm?.displayName || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm!, displayName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{mapping.displayName}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editForm?.description || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm!, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{mapping.description}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingIndex === index ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleSaveEdit}
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
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-primary hover:text-primary-dark"
                    >
                      수정
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>참고:</strong> 그룹 코드는 평가 데이터의 supplier_group과 매칭됩니다. 
          표시명과 설명만 수정할 수 있으며, 코드는 변경할 수 없습니다.
        </p>
      </div>
    </div>
  );
};

export default GroupMappingManager;
