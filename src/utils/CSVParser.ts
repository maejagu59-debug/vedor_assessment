import Papa from 'papaparse';
import { SupplierRawData } from '../types';

export class CSVParser {
  /**
   * CSV 파일을 파싱하여 SupplierRawData 배열로 변환
   */
  static async parseFile(file: File): Promise<SupplierRawData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: ';', // 세미콜론 구분자 사용
        complete: (results) => {
          try {
            const suppliers = results.data.map((row: any, index: number) => 
              CSVParser.validateAndTransform(row, index)
            ).filter(Boolean) as SupplierRawData[];
            
            resolve(suppliers);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV 파싱 오류: ${error.message}`));
        },
      });
    });
  }

  /**
   * 데이터 타입 변환 및 검증
   */
  static validateAndTransform(rawRow: any, index: number): SupplierRawData | null {
    try {
      // 필수 필드 검증
      const requiredFields = ['company_name', 'ceo_name'];
      for (const field of requiredFields) {
        if (!rawRow[field]) {
          console.warn(`행 ${index + 1}: 필수 필드 '${field}'가 누락되었습니다.`);
          return null;
        }
      }

      // ID 생성 (없으면 인덱스 기반으로 생성)
      const id = rawRow.id || `supplier_${index}`;

      // 숫자 필드 변환
      const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === '') {
          return 0;
        }
        const parsed = typeof value === 'string' 
          ? parseFloat(value.replace(/,/g, '')) 
          : Number(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const supplier: SupplierRawData = {
        id,
        company_name: String(rawRow.company_name || ''),
        ceo_name: String(rawRow.ceo_name || ''),
        establishment_date: String(rawRow.establishment_date || ''),
        website: String(rawRow.website || ''),
        main_products_services: String(rawRow.main_products_services || ''),
        
        // 재무 데이터
        current_assets: parseNumber(rawRow.current_assets),
        current_liabilities: parseNumber(rawRow.current_liabilities),
        total_assets: parseNumber(rawRow.total_assets),
        total_liabilities: parseNumber(rawRow.total_liabilities),
        equity: parseNumber(rawRow.equity),
        current_year_sales: parseNumber(rawRow.current_year_sales),
        previous_year_sales: parseNumber(rawRow.previous_year_sales),
        net_income: parseNumber(rawRow.net_income),
        
        // 평가 데이터
        safety_questionnaire_score: parseNumber(rawRow.safety_questionnaire_score),
        safety_questionnaire_grade: String(rawRow.safety_questionnaire_grade || 'N/A'),
        hq_employees: parseNumber(rawRow.hq_employees),
        bct_office_employees: parseNumber(rawRow.bct_office_employees),
        
        // 연락처
        bct_contact_name: String(rawRow.bct_contact_name || ''),
        bct_contact_phone: String(rawRow.bct_contact_phone || ''),
        bct_contact_email: String(rawRow.bct_contact_email || ''),
        
        // 추가 필드
        business_number: String(rawRow.business_number || ''),
        hq_address: String(rawRow.hq_address || ''),
        main_phone: String(rawRow.main_phone || ''),
        main_email: String(rawRow.main_email || ''),
      };

      return supplier;
    } catch (error) {
      console.error(`행 ${index + 1} 변환 중 오류:`, error);
      return null;
    }
  }

  /**
   * CSV 파일 유효성 검증
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // 파일 확장자 검증
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      return { valid: false, error: 'CSV 파일만 업로드 가능합니다.' };
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' };
    }

    // MIME 타입 검증
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (file.type && !allowedTypes.includes(file.type)) {
      return { valid: false, error: '올바른 CSV 파일 형식이 아닙니다.' };
    }

    return { valid: true };
  }
}
