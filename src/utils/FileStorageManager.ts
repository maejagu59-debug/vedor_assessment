/**
 * IndexedDB를 사용한 파일 저장 관리
 * 브라우저 로컬 저장소에 공급업체별 첨부 파일 저장
 */

export interface AttachedFile {
  id: string;
  supplier_id: string;
  supplier_name: string;
  business_number: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_data: Blob;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export class FileStorageManager {
  private static DB_NAME = 'SupplierFilesDB';
  private static DB_VERSION = 1;
  private static STORE_NAME = 'attachments';

  /**
   * IndexedDB 초기화
   */
  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('supplier_id', 'supplier_id', { unique: false });
          objectStore.createIndex('business_number', 'business_number', { unique: false });
          objectStore.createIndex('uploaded_at', 'uploaded_at', { unique: false });
        }
      };
    });
  }

  /**
   * 파일 저장
   */
  static async saveFile(
    supplierId: string,
    supplierName: string,
    businessNumber: string,
    file: File,
    uploadedBy: string,
    description?: string
  ): Promise<AttachedFile> {
    const db = await this.openDB();

    const attachedFile: AttachedFile = {
      id: `${supplierId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      supplier_id: supplierId,
      supplier_name: supplierName,
      business_number: businessNumber,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_data: file,
      uploaded_by: uploadedBy,
      uploaded_at: new Date().toISOString(),
      description,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(attachedFile);

      request.onsuccess = () => resolve(attachedFile);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 공급업체별 파일 목록 조회
   */
  static async getFilesBySupplier(supplierId: string): Promise<AttachedFile[]> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('supplier_id');
      const request = index.getAll(supplierId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 사업자번호로 파일 목록 조회
   */
  static async getFilesByBusinessNumber(businessNumber: string): Promise<AttachedFile[]> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('business_number');
      const request = index.getAll(businessNumber);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 파일 다운로드
   */
  static async downloadFile(fileId: string): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(fileId);

      request.onsuccess = () => {
        const file = request.result as AttachedFile;
        if (!file) {
          reject(new Error('파일을 찾을 수 없습니다.'));
          return;
        }

        // Blob을 다운로드 가능한 URL로 변환
        const url = URL.createObjectURL(file.file_data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 파일 삭제
   */
  static async deleteFile(fileId: string): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(fileId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 전체 파일 목록 조회
   */
  static async getAllFiles(): Promise<AttachedFile[]> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 파일 크기를 읽기 쉬운 형식으로 변환
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 파일 타입 아이콘 가져오기
   */
  static getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
    return '📎';
  }
}
