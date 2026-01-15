export interface TransactionData {
  supplier_name: string;
  business_number: string;
  transaction_amount: number; // 거래금액 (Vi)
  transaction_count: number; // 거래횟수 (Ti)
  months: number; // 거래 개월 수
}

export class TransactionParser {
  /**
   * Excel 파일에서 거래 데이터 파싱
   * Note: xlsx 라이브러리 설치 필요 (npm install xlsx)
   */
  static async parseExcelFile(file: File): Promise<TransactionData[]> {
    // xlsx 라이브러리가 설치되어 있지 않으면 에러 메시지 반환
    try {
      // @ts-ignore - xlsx 라이브러리 동적 import
      const XLSX = await import('xlsx');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const transactions: TransactionData[] = jsonData.map((row: any) => ({
              supplier_name: row['공급업체명'] || row['supplier_name'] || '',
              business_number: String(row['사업자번호'] || row['business_number'] || ''),
              transaction_amount: Number(row['거래금액'] || row['transaction_amount'] || 0),
              transaction_count: Number(row['거래횟수'] || row['transaction_count'] || 0),
              months: Number(row['거래개월수'] || row['months'] || 9),
            }));
            
            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsBinaryString(file);
      });
    } catch (error) {
      throw new Error('xlsx 라이브러리가 설치되지 않았습니다. npm install xlsx 명령을 실행하세요.');
    }
  }

  /**
   * 사업자번호로 거래 데이터 찾기
   */
  static findByBusinessNumber(
    transactions: TransactionData[],
    businessNumber: string
  ): TransactionData | undefined {
    return transactions.find(t => t.business_number === businessNumber);
  }

  /**
   * 월평균 거래금액 계산
   */
  static calculateMonthlyAverage(transaction: TransactionData): number {
    if (transaction.months === 0) return 0;
    return transaction.transaction_amount / transaction.months;
  }

  /**
   * 월평균 거래횟수 계산
   */
  static calculateMonthlyTransactionCount(transaction: TransactionData): number {
    if (transaction.months === 0) return 0;
    return transaction.transaction_count / transaction.months;
  }
}
