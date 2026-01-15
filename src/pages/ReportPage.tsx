import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { AnalysisTextGenerator } from '../utils/AnalysisTextGenerator';
import BasicInfoSection from '../components/report/BasicInfoSection';
import FinancialAnalysisSection from '../components/report/FinancialAnalysisSection';
import OverallRecommendationSection from '../components/report/OverallRecommendationSection';
import EvaluationSection from '../components/report/EvaluationSection';
import BenchmarkingSection from '../components/report/BenchmarkingSection';
import ScoreCalculationSection from '../components/report/ScoreCalculationSection';
import AttachmentsSection from '../components/report/AttachmentsSection';
import RawDataSection from '../components/report/RawDataSection';
import EvaluationSummaryBanner from '../components/report/EvaluationSummaryBanner';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplierById, suppliers, updateSupplierAnalysis } = useApp();
  const [evaluationScore, setEvaluationScore] = React.useState<number | undefined>();

  const supplier = id ? getSupplierById(id) : undefined;
  
  // 모든 평가 데이터 (카테고리별 통계 계산용)
  const allEvaluations = suppliers
    .filter(s => s.evaluation)
    .map(s => s.evaluation!);

  // 평가 점수가 변경되면 종합 의견 업데이트
  React.useEffect(() => {
    if (supplier && evaluationScore && evaluationScore !== supplier.evaluationScore) {
      // 평가 점수를 반영하여 종합 의견 재생성
      const { text: newRecommendation, riskLevel } = AnalysisTextGenerator.generateOverallRecommendation(
        supplier.analysis.financialAnalysis,
        supplier.analysis.operationalAnalysis,
        supplier.metrics,
        supplier.rawData,
        evaluationScore
      );
      
      updateSupplierAnalysis(supplier.rawData.id, {
        overallRecommendation: newRecommendation,
        riskLevel,
      });
    }
  }, [evaluationScore, supplier, updateSupplierAnalysis]);

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">공급업체를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 공급업체 정보가 존재하지 않습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
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
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              인쇄
            </button>
          </div>
        </div>
      </header>

      {/* 보고서 내용 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* 평가 요약 배너 (평가 데이터가 있는 경우) */}
          {supplier.evaluation && allEvaluations.length > 0 && (
            <EvaluationSummaryBanner
              supplier={supplier}
              allEvaluations={allEvaluations}
            />
          )}
          
          <BasicInfoSection supplier={supplier} />
          
          {/* 공급업체 평가 점수 계산 (평가 데이터가 있는 경우) */}
          {supplier.evaluation && allEvaluations.length > 0 && (
            <ScoreCalculationSection
              evaluation={supplier.evaluation}
              allEvaluations={allEvaluations}
              onScoreCalculated={setEvaluationScore}
            />
          )}
          
          <FinancialAnalysisSection supplier={supplier} />
          
          {/* 공급업체 평가 결과 (분석 포함) */}
          {supplier.evaluation && (
            <EvaluationSection 
              evaluation={supplier.evaluation}
              allEvaluations={allEvaluations}
            />
          )}
          
          {/* 카테고리 내 벤치마킹 분석 */}
          {supplier.evaluation && allEvaluations.length > 1 && (
            <BenchmarkingSection
              evaluation={supplier.evaluation}
              allEvaluations={allEvaluations}
            />
          )}
          
          <OverallRecommendationSection supplier={supplier} />
          
          {/* 첨부 서류 섹션 */}
          <AttachmentsSection
            supplierId={supplier.rawData.id}
            supplierName={supplier.rawData.company_name}
            businessNumber={supplier.rawData.business_number}
          />
          
          <RawDataSection supplier={supplier} />
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
