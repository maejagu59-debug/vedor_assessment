import Papa from 'papaparse';
import { EvaluationData } from '../types';

export class EvaluationParser {
  /**
   * 평가 CSV 파일을 파싱하여 EvaluationData 배열로 변환
   */
  static async parseFile(file: File): Promise<EvaluationData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: ';',
        complete: (results) => {
          try {
            const evaluations = results.data.map((row: any, index: number) => 
              EvaluationParser.validateAndTransform(row, index)
            ).filter(Boolean) as EvaluationData[];
            
            resolve(evaluations);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`평가 CSV 파싱 오류: ${error.message}`));
        },
      });
    });
  }

  /**
   * 데이터 타입 변환 및 검증
   */
  static validateAndTransform(rawRow: any, index: number): EvaluationData | null {
    try {
      const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === '') {
          return 0;
        }
        const parsed = typeof value === 'string' 
          ? parseFloat(value.replace(/,/g, '')) 
          : Number(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const parseBoolean = (value: any): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return false;
      };

      const parseJSON = (value: any): any => {
        if (!value || value === '') return {};
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      };

      const evaluation: EvaluationData = {
        id: String(rawRow.id || `eval_${index}`),
        supplier_name: String(rawRow.supplier_name || ''),
        supplier_group: String(rawRow.supplier_group || ''),
        detail_group: rawRow.detail_group ? String(rawRow.detail_group) : undefined,
        business_number: String(rawRow.business_number || ''),
        safety_passed: parseBoolean(rawRow.safety_passed),
        initiator: String(rawRow.initiator || ''),
        approver: String(rawRow.approver || ''),
        evaluation_date: String(rawRow.evaluation_date || ''),
        stability_score: parseNumber(rawRow.stability_score),
        stability_remarks: String(rawRow.stability_remarks || ''),
        sustainability_score: parseNumber(rawRow.sustainability_score),
        sustainability_remarks: String(rawRow.sustainability_remarks || ''),
        final_score: parseNumber(rawRow.final_score),
        pass: parseBoolean(rawRow.pass),
        status: String(rawRow.status || ''),
        stability_details: parseJSON(rawRow.stability_details),
        sustainability_details: parseJSON(rawRow.sustainability_details),
      };

      return evaluation;
    } catch (error) {
      console.error(`평가 데이터 행 ${index + 1} 변환 중 오류:`, error);
      return null;
    }
  }
}
