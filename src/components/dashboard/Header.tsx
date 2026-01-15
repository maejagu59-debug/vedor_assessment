import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import AdminLogin from '../AdminLogin';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { uploadSupplierCSV, uploadEvaluationCSV, isLoading, isAdmin, logout } = useApp();
  const supplierFileInputRef = useRef<HTMLInputElement>(null);
  const evaluationFileInputRef = useRef<HTMLInputElement>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleSupplierFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadSupplierCSV(file);
    } catch (error) {
      alert(error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.');
    }

    // 파일 입력 초기화
    if (supplierFileInputRef.current) {
      supplierFileInputRef.current.value = '';
    }
  };

  const handleEvaluationFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadEvaluationCSV(file);
    } catch (error) {
      alert(error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.');
    }

    // 파일 입력 초기화
    if (evaluationFileInputRef.current) {
      evaluationFileInputRef.current.value = '';
    }
  };

  const handleSupplierUploadClick = () => {
    supplierFileInputRef.current?.click();
  };

  const handleEvaluationUploadClick = () => {
    evaluationFileInputRef.current?.click();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                공급업체 분석 보고서
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                공급망 리스크, 데이터로 정확하게 예측하고 관리하세요.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <>
                  <input
                    ref={supplierFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleSupplierFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={evaluationFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleEvaluationFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={handleSupplierUploadClick}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2.5 border-2 border-transparent text-sm font-semibold rounded-xl card-shadow text-white smooth-transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                    style={{ backgroundColor: '#0085FF' }}
                  >
                    <svg
                      className="mr-2 -ml-1 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {isLoading ? '처리 중...' : '업체정보'}
                  </button>
                  <button
                    onClick={handleEvaluationUploadClick}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2.5 border-2 border-gray-300 text-sm font-semibold rounded-xl card-shadow bg-white text-gray-700 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:border-gray-400"
                  >
                    <svg
                      className="mr-2 -ml-1 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {isLoading ? '처리 중...' : '평가결과'}
                  </button>
                  <button
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center px-4 py-2.5 border-2 border-gray-300 text-sm font-semibold rounded-xl card-shadow bg-white text-gray-700 smooth-transition hover:scale-105 hover:border-gray-400"
                  >
                    <svg
                      className="mr-2 -ml-1 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    관리자
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg
                      className="mr-2 -ml-1 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg
                    className="mr-2 -ml-1 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  관리자 로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {showLogin && <AdminLogin onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;
