/**
 * FileUploader.tsx
 * 드래그앤드롭, 파일 선택, 진행률 표시
 */

'use client';

import React, { useRef, useState } from 'react';
import { useConversionStore } from '@/context/ConversionStore';
import { apiClient } from '@/services/api';
import { UploadProgress } from '@/types/api';

interface FileUploaderProps {
  onUploadComplete?: (fileId: string) => void;
  onError?: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });

  const { setUploadedFile, setProgress, setError } = useConversionStore();

  const handleFile = async (file: File) => {
    // 파일 타입 검증
    const validTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!validTypes.includes(file.type)) {
      const error = 'PPT 파일(pptx, ppt)만 업로드 가능합니다.';
      setError(error);
      onError?.(error);
      return;
    }

    // 파일 크기 체크 (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = `파일이 너무 큽니다. (최대 100MB, 현재 ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
      setError(error);
      onError?.(error);
      return;
    }

    try {
      setUploading(true);
      setError(undefined);
      setUploadedFile({ name: file.name, size: file.size });

      // API를 통해 파일 업로드
      const response = await apiClient.uploadFile(file, undefined, (progress) => {
        setUploadProgress(progress);
        setProgress(progress.percentage);
      });

      setUploading(false);
      onUploadComplete?.(response.fileId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 업로드 실패';
      setError(errorMessage);
      onError?.(errorMessage);
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative p-12 rounded-xl border-2 border-dashed transition-all
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : uploading
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }
        `}
      >
        {!uploading ? (
          <>
            {/* 아이콘 */}
            <div className="text-center mb-4">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">PPT 파일을 업로드하세요</h3>
              <p className="text-gray-600 mb-4">
                드래그앤드롭 또는 클릭하여 파일을 선택하세요
              </p>
              <p className="text-sm text-gray-500">지원 형식: .pptx, .ppt (최대 100MB)</p>
            </div>

            {/* 파일 선택 버튼 */}
            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                파일 선택
              </button>
            </div>

            {/* 숨겨진 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pptx,.ppt,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </>
        ) : (
          <>
            {/* 업로드 진행 중 */}
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">파일 업로드 중...</h3>

              {/* 진행률 바 */}
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* 진행률 텍스트 */}
              <p className="text-gray-600 text-sm">
                {uploadProgress.percentage}% 완료
                {uploadProgress.total > 0 && (
                  <span className="block mt-1">
                    {(uploadProgress.loaded / 1024 / 1024).toFixed(2)} /{' '}
                    {(uploadProgress.total / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
