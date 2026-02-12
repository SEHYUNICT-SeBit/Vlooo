'use client';

import React, { createContext, useContext, useState } from 'react';

interface FileContextType {
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: React.ReactNode }) => {
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  return (
    <FileContext.Provider value={{ pendingFile, setPendingFile }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within FileProvider');
  }
  return context;
};
