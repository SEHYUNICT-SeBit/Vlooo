/**
 * FileUploadModal Context
 * 
 * 전역 파일 업로드 모달 상태 관리
 */

'use client';

import React, { createContext, useContext, useState } from 'react';

interface FileUploadModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const FileUploadModalContext = createContext<FileUploadModalContextType | undefined>(undefined);

export const FileUploadModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <FileUploadModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </FileUploadModalContext.Provider>
  );
};

export const useFileUploadModal = () => {
  const context = useContext(FileUploadModalContext);
  if (!context) {
    throw new Error('useFileUploadModal must be used within FileUploadModalProvider');
  }
  return context;
};
