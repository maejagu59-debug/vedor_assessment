# Requirements Document

## Introduction

공급업체 평가 결과 데이터(CSV)를 기반으로 각 공급업체에 대한 전문가 수준의 기업 분석 보고서를 자동으로 생성하는 웹 애플리케이션입니다. 재무 건전성, 운영/기술 역량을 분석하여 구매 의사결정을 지원하는 일관되고 신속한 분석 자료를 제공합니다.

## Glossary

- **System**: 공급업체 분석 보고서 자동 생성 웹 애플리케이션
- **User**: 구매 담당자 또는 공급업체 평가 담당자
- **CSV File**: 공급업체 평가 데이터가 포함된 쉼표로 구분된 값 파일
- **Supplier Record**: CSV 파일의 각 행에 해당하는 개별 공급업체 데이터
- **Financial Metrics**: 유동비율, 부채비율, 순이익률 등 재무 건전성을 나타내는 계산된 지표
- **Analysis Report**: 재무 분석, 운영/기술 역량 분석, 종합 의견을 포함한 공급업체별 전문가 분석 문서
- **Safety Score**: CSV 데이터의 safety_questionnaire_score 필드 값
- **Risk Grade**: 공급업체의 종합 리스크 등급 (A/B/C/D)

## Requirements

### Requirement 1

**User Story:** As a 구매 담당자, I want to upload a CSV file containing supplier evaluation data, so that I can automatically generate analysis reports for multiple suppliers at once

#### Acceptance Criteria

1. WHEN the User selects a CSV file through the upload interface, THE System SHALL parse the file and extract all supplier records
2. IF the uploaded file is not in valid CSV format, THEN THE System SHALL display an error message indicating the file format is invalid
3. WHEN the CSV file is successfully parsed, THE System SHALL convert financial data fields (assets, liabilities, sales, net income) to numeric types
4. IF any required data field is missing or contains invalid values in a supplier record, THEN THE System SHALL mark that field as unavailable and log a warning for that record
5. WHEN the data parsing is complete, THE System SHALL store all supplier records in the application state and display the supplier list

### Requirement 2

**User Story:** As a 구매 담당자, I want to view a dashboard with summary statistics of all suppliers, so that I can quickly understand the overall supplier portfolio status

#### Acceptance Criteria

1. WHEN the User navigates to the dashboard screen, THE System SHALL display the total count of supplier records
2. THE System SHALL calculate and display the average safety score across all suppliers
3. THE System SHALL calculate and display the distribution of risk grades (A/B/C/D counts) across all suppliers
4. WHEN new CSV data is uploaded, THE System SHALL recalculate and update all summary statistics within 2 seconds

### Requirement 3

**User Story:** As a 구매 담당자, I want to search and filter the supplier list, so that I can quickly find specific suppliers or groups of suppliers

#### Acceptance Criteria

1. WHEN the User enters text in the search field, THE System SHALL filter the supplier list to show only records where the company name contains the search text
2. WHEN the User selects a risk grade filter option, THE System SHALL display only suppliers matching the selected grade
3. THE System SHALL update the filtered list within 500 milliseconds of the User's input
4. WHEN the User clears all filters, THE System SHALL display the complete supplier list

### Requirement 4

**User Story:** As a 구매 담당자, I want to view a detailed list of all suppliers with key information, so that I can select a supplier for detailed analysis

#### Acceptance Criteria

1. THE System SHALL display a table containing company name, CEO, main product, final risk grade, and financial health summary for each supplier
2. WHEN the User clicks on a supplier row in the table, THE System SHALL navigate to the detailed analysis report screen for that supplier
3. THE System SHALL display at least 20 supplier records per page without performance degradation
4. THE System SHALL sort the supplier list by company name in ascending order by default

### Requirement 5

**User Story:** As a 구매 담당자, I want to view automatically calculated financial metrics for each supplier, so that I can assess their financial health

#### Acceptance Criteria

1. WHEN the System processes a supplier record, THE System SHALL calculate the liquidity ratio as Current Assets divided by Current Liabilities
2. WHEN the System processes a supplier record, THE System SHALL calculate the debt-to-equity ratio as Total Liabilities divided by Equity
3. WHEN the System processes a supplier record, THE System SHALL calculate the net profit margin as Net Income divided by Current Year Sales
4. WHEN the System processes a supplier record, THE System SHALL calculate the sales growth rate as (Current Year Sales minus Previous Year Sales) divided by Previous Year Sales
5. IF any denominator in the financial calculations is zero or negative, THEN THE System SHALL mark that metric as incalculable and display "N/A"

### Requirement 6

**User Story:** As a 구매 담당자, I want to read expert-level financial health analysis text for each supplier, so that I can understand the financial implications without manual calculation

#### Acceptance Criteria

1. WHEN the liquidity ratio is 200% or higher AND the debt-to-equity ratio is below 100%, THE System SHALL generate positive financial analysis text indicating strong financial stability
2. WHEN the debt-to-equity ratio exceeds 150% OR the sales growth rate is negative, THE System SHALL generate cautionary financial analysis text indicating financial concerns
3. WHEN the net profit margin is positive AND the sales growth rate is positive, THE System SHALL include text indicating healthy profitability and growth
4. THE System SHALL combine multiple financial indicators into a coherent analysis paragraph of 100 to 300 characters

### Requirement 7

**User Story:** As a 구매 담당자, I want to read expert-level operational and technical capability analysis for each supplier, so that I can assess non-financial risk factors

#### Acceptance Criteria

1. WHEN the safety score is in the top 25% of all suppliers, THE System SHALL generate text highlighting excellent safety management systems
2. WHEN the safety score is in the bottom 25% of all suppliers, THE System SHALL generate text indicating safety management improvement needs
3. THE System SHALL analyze workforce composition data (regular employees, technical staff ratio) and include relevant strengths or weaknesses in the analysis text
4. THE System SHALL generate operational analysis text of 100 to 300 characters combining safety, workforce, and quality system evaluations

### Requirement 8

**User Story:** As a 구매 담당자, I want to read comprehensive recommendations and trading strategies for each supplier, so that I can make informed procurement decisions

#### Acceptance Criteria

1. WHEN both financial health and operational capability analyses indicate high risk, THE System SHALL generate recommendations to limit transaction amounts and require improvement plans
2. WHEN both financial health and operational capability analyses indicate low risk, THE System SHALL generate recommendations for strategic partnership and long-term contracts
3. WHEN financial health is strong but operational capability is weak, THE System SHALL generate recommendations for conditional engagement with operational improvement requirements
4. THE System SHALL generate overall recommendation text of 150 to 400 characters that synthesizes all analysis areas

### Requirement 9

**User Story:** As a 구매 담당자, I want to view a comprehensive analysis report for a selected supplier on a single page, so that I can review all relevant information without navigation

#### Acceptance Criteria

1. WHEN the User selects a supplier from the list, THE System SHALL display a report page containing basic information, financial analysis, operational analysis, and overall recommendations
2. THE System SHALL display financial metrics as both numerical values and visual charts on the report page
3. THE System SHALL display the complete original CSV data for the supplier in an expandable section for transparency
4. THE System SHALL render the complete report page within 1 second of the User's selection

### Requirement 10

**User Story:** As a 구매 담당자, I want to view financial metrics as visual charts, so that I can quickly grasp the financial status through visual representation

#### Acceptance Criteria

1. THE System SHALL display liquidity ratio, debt-to-equity ratio, and net profit margin as bar charts or gauge charts
2. WHEN a financial metric is unavailable (N/A), THE System SHALL display a placeholder indicating the data is not calculable
3. THE System SHALL use color coding (green for positive, yellow for caution, red for concern) to indicate the health level of each metric
4. THE System SHALL render all charts within 500 milliseconds of page load
