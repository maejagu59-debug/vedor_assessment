import React, { useState, useEffect } from 'react';
import { FileStorageManager, AttachedFile } from '../../utils/FileStorageManager';
import { useApp } from '../../contexts/AppContext';

interface AttachmentsSectionProps {
  supplierId: string;
  supplierName: string;
  businessNumber: string;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  supplierId,
  supplierName,
  businessNumber,
}) => {
  const { isAdmin } = useApp();
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  // 파일 목록 로드
  useEffect(() => {
    loadFiles();
  }, [supplierId]);

  const loadFiles = async () => {
    try {
      const attachedFiles = await FileStorageManager.getFilesBySupplier(supplierId);
      setFiles(attachedFiles.sort((a, b) => 
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      ));
    } catch (error) {
      console.error('파일 목록 로드 실패:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // PDF 파일만 허용
        if (file.type !== 'application/pdf') {
          setUploadError(`${file.name}은(는) PDF 파일이 아닙니다. PDF 파일만 업로드 가능합니다.`);
          continue;
        }

        // 파일 크기 제한 (50MB)
        if (file.size > 50 * 1024 * 1024) {
          setUploadError(`${file.name}의 크기가 너무 큽니다. 최대 50MB까지 업로드 가능합니다.`);
          continue;
        }

        await FileStorageManager.saveFile(
          supplierId,
          supplierName,
          businessNumber,
          file,
          '관리자', // 실제로는 로그인한 사용자 정보 사용
          description || undefined
        );
      }

      // 업로드 완료 후 목록 새로고침
      await loadFiles();
      setDescription('');
      
      // 파일 입력 초기화
      event.target.value = '';
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setUploadError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      await FileStorageManager.downloadFile(fileId);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await FileStorageManager.deleteFile(fileId);
      await loadFiles();
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-white card-shadow rounded-2xl p-10 border border-gray-100/50 smooth-transition">
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title mb-0">첨부 서류</h3>
        {isAdmin && (
          <span className="text-xs text-gray-500">
            관리자만 파일을 업로드/삭제할 수 있습니다
          </span>
        )}
      </div>

      {/* 파일 업로드 영역 (관리자만) */}
      {isAdmin && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">파일 업로드</h4>
          
          <div className="mb-3">
            <label className="block text-xs text-gray-700 mb-1">
              설명 (선택사항)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 사업자등록증, 재무제표 등"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div className={`
                flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer
                ${isUploading 
                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                  : 'border-blue-300 bg-white hover:bg-blue-50'
                }
              `}>
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-blue-700">
                  {isUploading ? '업로드 중...' : 'PDF 파일 선택 (최대 50MB)'}
                </span>
              </div>
            </label>
          </div>

          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {uploadError}
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500">
            * PDF 파일만 업로드 가능합니다. 여러 파일을 동시에 선택할 수 있습니다.
          </p>
        </div>
      )}

      {/* 파일 목록 */}
      {files.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">첨부된 파일이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-2xl mr-3">
                  {FileStorageManager.getFileIcon(file.file_type)}
                </span>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 truncate">
                    {file.file_name}
                  </h5>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{FileStorageManager.formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(file.uploaded_at).toLocaleDateString('ko-KR')}</span>
                    <span>•</span>
                    <span>{file.uploaded_by}</span>
                  </div>
                  {file.description && (
                    <p className="mt-1 text-xs text-gray-600">{file.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* 다운로드 버튼 */}
                <button
                  onClick={() => handleDownload(file.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="다운로드"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                {/* 삭제 버튼 (관리자만) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(file.id, file.file_name)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 파일 개수 표시 */}
      {files.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          총 {files.length}개의 파일
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;
