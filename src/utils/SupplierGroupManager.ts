/**
 * 공급업체 그룹 관리 유틸리티
 */

export interface SupplierGroupMapping {
  code: string; // A, B, C, D, E, F, G, H
  displayName: string; // 표시될 그룹명
  description: string; // 그룹 설명
}

export interface SupplierGroupOverride {
  businessNumber: string;
  companyName: string;
  originalGroup: string;
  overrideGroup: string;
  subGroup: string;
}

export class SupplierGroupManager {
  private static readonly DEFAULT_GROUPS: SupplierGroupMapping[] = [
    {
      code: 'A',
      displayName: 'Group A',
      description: '주요 외주용역',
    },
    {
      code: 'B',
      displayName: 'Group B',
      description: '자재 (정비, 운영)',
    },
    {
      code: 'C',
      displayName: 'Group C',
      description: '연료비 (유류 외)',
    },
    {
      code: 'D',
      displayName: 'Group D',
      description: '시설공사',
    },
    {
      code: 'E',
      displayName: 'Group E',
      description: '외주용역 (세부그룹: E1~E4)',
    },
    {
      code: 'G',
      displayName: 'Group G',
      description: '소모품(기타) / 일반(기타)',
    },
  ];

  // 세부 그룹 옵션 (E 그룹만 세분화)
  private static readonly SUB_GROUPS: Record<string, string[]> = {
    'E': ['E1', 'E2', 'E3', 'E4'],
  };

  private static readonly STORAGE_KEY = 'supplier_group_mappings';
  private static readonly OVERRIDES_KEY = 'supplier_group_overrides';
  private static initialized = false;

  /**
   * 초기화 - 저장된 매핑이 없으면 기본값 설정
   */
  private static initialize(): void {
    if (this.initialized) return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        // 기본값 저장
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULT_GROUPS));
      }
      this.initialized = true;
    } catch (error) {
      console.error('그룹 매핑 초기화 실패:', error);
    }
  }

  /**
   * 저장된 그룹 매핑 가져오기
   */
  static getGroupMappings(): SupplierGroupMapping[] {
    this.initialize();
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('그룹 매핑 로드 실패:', error);
    }
    return this.DEFAULT_GROUPS;
  }

  /**
   * 그룹 매핑 저장
   */
  static saveGroupMappings(mappings: SupplierGroupMapping[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
      console.error('그룹 매핑 저장 실패:', error);
      throw new Error('그룹 매핑을 저장할 수 없습니다.');
    }
  }

  /**
   * 특정 그룹 코드의 표시명 가져오기
   */
  static getGroupDisplayName(code: string): string {
    const mappings = this.getGroupMappings();
    const mapping = mappings.find(m => m.code === code);
    return mapping ? `${mapping.displayName} - ${mapping.description}` : `${code}그룹`;
  }

  /**
   * 특정 그룹 코드의 짧은 표시명 가져오기
   */
  static getGroupShortName(code: string): string {
    const mappings = this.getGroupMappings();
    const mapping = mappings.find(m => m.code === code);
    return mapping ? mapping.displayName : `${code}그룹`;
  }

  /**
   * 기본 그룹 매핑으로 초기화
   */
  static resetToDefault(): void {
    this.saveGroupMappings(this.DEFAULT_GROUPS);
  }

  /**
   * 모든 그룹 코드 목록 가져오기
   */
  static getAllGroupCodes(): string[] {
    return this.getGroupMappings().map(m => m.code);
  }

  /**
   * 세부 그룹 옵션 가져오기
   */
  static getSubGroupOptions(groupCode: string): string[] {
    return this.SUB_GROUPS[groupCode] || [];
  }

  /**
   * 공급업체 그룹 오버라이드 가져오기
   */
  static getGroupOverrides(): SupplierGroupOverride[] {
    try {
      const stored = localStorage.getItem(this.OVERRIDES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('그룹 오버라이드 로드 실패:', error);
    }
    return [];
  }

  /**
   * 공급업체 그룹 오버라이드 저장
   */
  static saveGroupOverrides(overrides: SupplierGroupOverride[]): void {
    try {
      localStorage.setItem(this.OVERRIDES_KEY, JSON.stringify(overrides));
    } catch (error) {
      console.error('그룹 오버라이드 저장 실패:', error);
      throw new Error('그룹 오버라이드를 저장할 수 없습니다.');
    }
  }

  /**
   * 특정 공급업체의 그룹 오버라이드 가져오기
   */
  static getSupplierGroupOverride(businessNumber: string): SupplierGroupOverride | null {
    const overrides = this.getGroupOverrides();
    return overrides.find(o => o.businessNumber === businessNumber) || null;
  }

  /**
   * 공급업체 그룹 오버라이드 설정
   */
  static setSupplierGroupOverride(override: SupplierGroupOverride): void {
    const overrides = this.getGroupOverrides();
    const index = overrides.findIndex(o => o.businessNumber === override.businessNumber);
    
    if (index >= 0) {
      overrides[index] = override;
    } else {
      overrides.push(override);
    }
    
    this.saveGroupOverrides(overrides);
  }

  /**
   * 공급업체 그룹 오버라이드 삭제
   */
  static removeSupplierGroupOverride(businessNumber: string): void {
    const overrides = this.getGroupOverrides();
    const filtered = overrides.filter(o => o.businessNumber !== businessNumber);
    this.saveGroupOverrides(filtered);
  }

  /**
   * 공급업체의 실제 그룹 코드 가져오기 (오버라이드 적용)
   */
  static getEffectiveGroup(businessNumber: string, originalGroup: string): string {
    const override = this.getSupplierGroupOverride(businessNumber);
    return override ? override.overrideGroup : originalGroup;
  }

  /**
   * 공급업체의 세부 그룹 가져오기
   */
  static getEffectiveSubGroup(businessNumber: string): string {
    const override = this.getSupplierGroupOverride(businessNumber);
    return override ? override.subGroup : '';
  }
}
