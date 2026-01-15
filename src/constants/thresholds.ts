export const FINANCIAL_THRESHOLDS = {
  liquidityRatio: {
    excellent: 200,  // 200% 이상
    good: 150,       // 150% 이상
    caution: 100,    // 100% 미만
  },
  debtToEquityRatio: {
    excellent: 100,  // 100% 미만
    good: 150,       // 150% 미만
    caution: 150,    // 150% 이상
  },
  netProfitMargin: {
    excellent: 10,   // 10% 이상
    good: 5,         // 5% 이상
    caution: 0,      // 0% 미만
  },
  salesGrowthRate: {
    excellent: 10,   // 10% 이상
    good: 0,         // 0% 이상
    caution: -5,     // -5% 미만
  },
} as const;

export const OPERATIONAL_THRESHOLDS = {
  technicalStaffRatio: {
    excellent: 0.3,  // 30% 이상
    good: 0.2,       // 20% 이상
    caution: 0.1,    // 10% 미만
  },
  qualitySystemScore: {
    excellent: 80,   // 80점 이상
    good: 60,        // 60점 이상
    caution: 60,     // 60점 미만
  },
} as const;

export const FILE_UPLOAD_LIMITS = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.csv'],
  allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
} as const;
