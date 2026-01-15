import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';

const SearchAndFilter: React.FC = () => {
  const { filters, setFilters } = useApp();
  const [searchInput, setSearchInput] = useState(filters.searchText);

  // 디바운싱: 500ms 후에 검색 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ searchText: searchInput });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, setFilters]);

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilters({ selectedGrade: value === '' ? null : value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 검색 입력 */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              공급업체 검색
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="회사명으로 검색..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* 등급 필터 */}
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              등급 필터
            </label>
            <select
              id="grade"
              value={filters.selectedGrade || ''}
              onChange={handleGradeChange}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">전체 등급</option>
              <option value="S">S등급</option>
              <option value="A">A등급</option>
              <option value="B">B등급</option>
              <option value="C">C등급</option>
              <option value="D">D등급</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
