import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';

interface TransactionDataInputProps {
  supplierId: string;
  supplierName: string;
  businessNumber: string;
  onDataChange: (amount: number, count: number) => void;
}

interface StoredTransactionData {
  supplier_id: string;
  transaction_amount: number; // 억원 단위
  transaction_count: number; // 회
  updated_at: string;
  updated_by: string;
}

const TransactionDataInput: React.FC<TransactionDataInputProps> = ({
  supplierId,
  supplierName,
  businessNumber,
  onDataChange,
}) => {
  const { isAdmin } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [count, setCount] = useState<string>('0');
  const [savedData, setSavedData] = useState<StoredTransactionData | null>(null);

  // LocalStorage 키 (사업자등록번호 사용)
  const STORAGE_KEY = `transaction_data_${businessNumber}`;

  // 저장된 데이터 로드
  useEffect(() => {
    loadSavedData();
  }, [businessNumber]);

  const loadSavedData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredTransactionData = JSON.parse(stored);
        setSavedData(data);
        setAmount(data.transaction_amount.toString());
        setCount(data.transaction_count.toString());
        onDataChange(data.transaction_amount, data.transaction_count);
      }
    } catch (error) {
      console.error('거래 데이터 로드 실패:', error);
    }
  };

  const handleSave = () => {
    const amountNum = parseFloat(amount) || 0;
    const countNum = parseInt(count) || 0;

    const data: StoredTransactionData = {
      supplier_id: supplierId,
      transaction_amount: amountNum,
      transaction_count: countNum,
      updated_at: new Date().toISOString(),
      updated_by: '관리자',
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedData(data);
      setIsEditing(false);
      onDataChange(amountNum, countNum);
    } catch (error) {
      console.error('거래 데이터 저장 실패:', error);
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    if (savedData) {
      setAmount(savedData.transaction_amount.toString());
      setCount(savedData.transaction_count.toString());
    } else {
      setAmount('0');
      setCount('0');
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title mb-0">거래 데이터</h3>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            수정
          </button>
        )}
      </div>

      {isEditing ? (
        // 편집 모드
        <div className="space-y-4">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 mb-3">
              <strong>{supplierName}</strong>의 거래 데이터를 입력하세요.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 거래금액 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래금액 (J)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">억원</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  예: 15.5 (15억 5천만원)
                </p>
              </div>

              {/* 거래횟수 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래횟수 (K)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">회</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  예: 120 (120회)
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl smooth-transition hover:scale-105"
                style={{ backgroundColor: '#0085FF' }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : (
        // 조회 모드
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 거래금액 표시 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">거래금액 (J)</div>
            <div className="text-2xl font-bold text-gray-900">
              {savedData ? savedData.transaction_amount.toFixed(2) : '0.00'}
              <span className="text-base font-normal text-gray-600 ml-2">억원</span>
            </div>
          </div>

          {/* 거래횟수 표시 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">거래횟수 (K)</div>
            <div className="text-2xl font-bold text-gray-900">
              {savedData ? savedData.transaction_count.toLocaleString() : '0'}
              <span className="text-base font-normal text-gray-600 ml-2">회</span>
            </div>
          </div>
        </div>
      )}

      {/* 마지막 업데이트 정보 */}
      {savedData && !isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          마지막 업데이트: {new Date(savedData.updated_at).toLocaleString('ko-KR')} ({savedData.updated_by})
        </div>
      )}

      {!savedData && !isEditing && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {isAdmin ? '거래 데이터를 입력하려면 "수정" 버튼을 클릭하세요.' : '거래 데이터가 입력되지 않았습니다.'}
        </div>
      )}
    </div>
  );
};

export default TransactionDataInput;
