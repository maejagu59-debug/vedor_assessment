import React from 'react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/dashboard/Header';
import StatisticsSummary from '../components/dashboard/StatisticsSummary';
import SearchAndFilter from '../components/dashboard/SearchAndFilter';
import SupplierTable from '../components/dashboard/SupplierTable';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { isLoading, suppliers } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {isLoading ? (
        <LoadingSpinner message="CSV 파일을 처리하고 있습니다..." />
      ) : (
        <>
          {suppliers.length > 0 && (
            <>
              <StatisticsSummary />
              <SearchAndFilter />
            </>
          )}
          <SupplierTable />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
