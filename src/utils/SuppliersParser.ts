import Papa from 'papaparse';

export interface SupplierListData {
  id: string;
  name: string;
  supplier_group: string; // 카테고리 (A, B, C, D, E, G, H)
  detail_group?: string; // 세부 그룹 (E1, E2, E3, E4 등)
  department: string;
  created_at: string;
  business_number: string;
}

export class SuppliersParser {
  /**
   * Suppliers CSV 파일 파싱
   */
  static async parseFile(file: File): Promise<SupplierListData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const suppliers: SupplierListData[] = results.data.map((row: any) => ({
              id: row.id?.trim() || '',
              name: row.name?.trim() || '',
              supplier_group: row.supplier_group?.trim() || '',
              detail_group: row.detail_group?.trim() || undefined,
              department: row.department?.trim() || '',
              created_at: row.created_at?.trim() || '',
              business_number: row.business_number?.trim() || '',
            }));

            resolve(suppliers.filter(s => s.id && s.name));
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * 사업자번호로 공급업체 찾기
   */
  static findByBusinessNumber(
    suppliers: SupplierListData[],
    businessNumber: string
  ): SupplierListData | undefined {
    return suppliers.find(s => s.business_number === businessNumber);
  }

  /**
   * 카테고리별 공급업체 수 계산
   */
  static countByCategory(suppliers: SupplierListData[]): Record<string, number> {
    const counts: Record<string, number> = {};
    suppliers.forEach(s => {
      counts[s.supplier_group] = (counts[s.supplier_group] || 0) + 1;
    });
    return counts;
  }
}
