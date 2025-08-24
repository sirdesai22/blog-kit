
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface BlogTableContextType {
  pinnedIds: Set<string>;
  togglePin: (id: string) => void;
}

const BlogTableContext = createContext<BlogTableContextType | undefined>(
  undefined
);

export const useBlogTable = () => {
  const context = useContext(BlogTableContext);
  if (!context) {
    throw new Error('useBlogTable must be used within a BlogTableProvider');
  }
  return context;
};

export const BlogTableProvider = ({ children }: { children: ReactNode }) => {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const newPinned = new Set(prev);
      if (newPinned.has(id)) {
        newPinned.delete(id);
      } else {
        newPinned.add(id);
      }
      return newPinned;
    });
  };

  return (
    <BlogTableContext.Provider value={{ pinnedIds, togglePin }}>
      {children}
    </BlogTableContext.Provider>
  );
};