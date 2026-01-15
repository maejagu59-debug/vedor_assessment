/**
 * localStorage 데이터를 추출하여 JSON으로 내보내는 유틸리티
 * 브라우저 콘솔에서 사용:
 * 
 * import { DataExporter } from './utils/DataExporter';
 * DataExporter.exportAllData();
 */

export interface ExportedData {
  supplierGroupOverrides: any[];
  transactionData: Record<string, any>;
  timestamp: string;
}

export class DataExporter {
  /**
   * 모든 localStorage 데이터를 추출
   */
  static exportAllData(): ExportedData {
    const data: ExportedData = {
      supplierGroupOverrides: [],
      transactionData: {},
      timestamp: new Date().toISOString(),
    };

    // 공급업체 그룹 오버라이드 추출
    try {
      const overrides = localStorage.getItem('supplier_group_overrides');
      if (overrides) {
        data.supplierGroupOverrides = JSON.parse(overrides);
      }
    } catch (error) {
      console.error('그룹 오버라이드 추출 실패:', error);
    }

    // 거래 데이터 추출
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('transaction_data_')) {
          const value = localStorage.getItem(key);
          if (value) {
            data.transactionData[key] = JSON.parse(value);
          }
        }
      }
    } catch (error) {
      console.error('거래 데이터 추출 실패:', error);
    }

    return data;
  }

  /**
   * 데이터를 JSON 파일로 다운로드
   */
  static downloadAsJSON(): void {
    const data = this.exportAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supplier-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * JSON 데이터를 localStorage에 임포트
   */
  static importData(data: ExportedData): void {
    try {
      // 그룹 오버라이드 임포트
      if (data.supplierGroupOverrides && data.supplierGroupOverrides.length > 0) {
        localStorage.setItem('supplier_group_overrides', JSON.stringify(data.supplierGroupOverrides));
        console.log(`✅ ${data.supplierGroupOverrides.length}개의 그룹 오버라이드 임포트 완료`);
      }

      // 거래 데이터 임포트
      let transactionCount = 0;
      for (const [key, value] of Object.entries(data.transactionData)) {
        localStorage.setItem(key, JSON.stringify(value));
        transactionCount++;
      }
      console.log(`✅ ${transactionCount}개의 거래 데이터 임포트 완료`);

      console.log('✅ 모든 데이터 임포트 완료! 페이지를 새로고침하세요.');
    } catch (error) {
      console.error('❌ 데이터 임포트 실패:', error);
    }
  }

  /**
   * 초기 데이터 로드 (앱 시작 시)
   */
  static async loadInitialData(): Promise<void> {
    try {
      // public 폴더의 초기 데이터 파일 확인
      const response = await fetch('/initial-data.json');
      if (response.ok) {
        const data: ExportedData = await response.json();
        
        // localStorage가 비어있을 때만 초기 데이터 로드
        const hasExistingData = localStorage.getItem('supplier_group_overrides') !== null;
        
        if (!hasExistingData) {
          this.importData(data);
          console.log('✅ 초기 데이터 로드 완료');
        } else {
          console.log('ℹ️ 기존 데이터가 있어 초기 데이터를 로드하지 않습니다.');
        }
      }
    } catch (error) {
      // 초기 데이터 파일이 없으면 무시
      console.log('ℹ️ 초기 데이터 파일이 없습니다.');
    }
  }
}

// 브라우저 콘솔에서 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).DataExporter = DataExporter;
}
