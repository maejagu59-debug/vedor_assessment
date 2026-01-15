import React from 'react';

interface StabilityDetailsViewProps {
  details: {
    debt: number;
    equity: number;
    expertise: number;
    liquidity: number;
  };
}

const StabilityDetailsView: React.FC<StabilityDetailsViewProps> = ({ details }) => {
  const questions = [
    {
      id: 'expertise',
      category: '전문성',
      text: '사업 영업기간',
      options: [
        { value: 5, label: '15년 이상' },
        { value: 4, label: '10년 이상 15년 미만' },
        { value: 3, label: '5년 이상 10년 미만' },
        { value: 2, label: '3년 이상 5년 미만' },
        { value: 1, label: '3년 미만' }
      ]
    },
    {
      id: 'liquidity',
      category: '재무건전성',
      text: '유동비율 (유동자산 / 유동부채 × 100)',
      options: [
        { value: 5, label: '200% 이상' },
        { value: 4, label: '180% 이상 ~ 200% 미만' },
        { value: 3, label: '160% 이상 ~ 180% 미만' },
        { value: 2, label: '140% 이상 ~ 160% 미만' },
        { value: 1, label: '140% 미만' }
      ]
    },
    {
      id: 'debt',
      category: '재무건전성',
      text: '부채비율 (부채총액 / 자기자본 × 100)',
      options: [
        { value: 5, label: '0% 이상 ~ 200% 미만' },
        { value: 4, label: '200% 이상 ~ 220% 미만' },
        { value: 3, label: '220% 이상 ~ 240% 미만' },
        { value: 2, label: '240% 이상 ~ 260% 미만' },
        { value: 1, label: '260% 이상' }
      ]
    },
    {
      id: 'equity',
      category: '재무건전성',
      text: '자기자본비율 (자기자본 / 총자산 × 100)',
      options: [
        { value: 5, label: '8% 이상' },
        { value: 4, label: '6% 이상 ~ 8% 미만' },
        { value: 3, label: '4% 이상 ~ 6% 미만' },
        { value: 2, label: '2% 이상 ~ 4% 미만' },
        { value: 1, label: '2% 미만' }
      ]
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 5) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 카테고리별로 그룹화
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, typeof questions>);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h5 className="text-sm font-medium text-gray-900 mb-4">안정성 세부 항목</h5>
      <div className="space-y-4">
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
          <div key={category} className="bg-white rounded-lg p-4 border border-gray-100">
            <h6 className="text-sm font-bold text-gray-900 mb-3">{category}</h6>
            <div className="space-y-3">
              {categoryQuestions.map((question) => {
                const userScore = details[question.id as keyof typeof details] || 0;
                const selectedOption = question.options.find(opt => opt.value === userScore);
                
                return (
                  <div key={question.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <p className="text-xs text-gray-700 mb-2 font-medium">{question.text}</p>
                    
                    {/* 배점 기준 */}
                    <div className="ml-3 mb-2 space-y-1">
                      <p className="text-xs font-semibold text-gray-600">배점 기준:</p>
                      {question.options.map(opt => (
                        <p key={opt.value} className="text-xs text-gray-500">
                          • {opt.label} (배점 {opt.value}점)
                        </p>
                      ))}
                    </div>
                    
                    {/* 선택된 답변 */}
                    <div className="ml-3 bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs font-semibold text-blue-900 mb-1">선택된 답변:</p>
                      {selectedOption ? (
                        <>
                          <p className="text-xs text-gray-700">{selectedOption.label}</p>
                          <p className={`text-xs font-bold mt-1 ${getScoreColor(userScore)}`}>
                            획득 점수: {userScore}점
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500">답변 없음</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StabilityDetailsView;
