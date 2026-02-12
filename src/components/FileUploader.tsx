/**
 * FileUploader.tsx
 * 드래그앤드롭, 파일 선택, 진행률 표시
 */

'use client';

import React, { useRef, useState } from 'react';
import { useConversionStore } from '@/context/ConversionStore';

interface FileUploaderProps {
  onUploadComplete?: (file: File) => void;
  onError?: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { setUploadedFile, setError } = useConversionStore();

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
      setError(undefined);
      setUploadedFile({ name: file.name, size: file.size });
      onUploadComplete?.(file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 업로드 실패';
      setError(errorMessage);
      onError?.(errorMessage);
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
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border border-dashed p-10 transition-all
          ${
            isDragging
              ? 'border-[color:var(--accent)] bg-[color:var(--surface)]'
              : 'border-[color:var(--line)] bg-white hover:border-[color:var(--accent)] cursor-pointer'
          }
        `}
      >
        <div className="text-center space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
            Upload
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">PPT 파일을 업로드하세요</h3>
          <p className="text-sm text-[color:var(--muted)]">
            드래그 앤 드롭 또는 버튼을 눌러 파일을 선택합니다.
          </p>
          <p className="text-xs text-[color:var(--muted)]">지원 형식: .ppt, .pptx (최대 100MB)</p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--accent-strong)] transition"
          >
            파일 선택
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx,.ppt,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUploader;
