'use client';

import { createContext, useContext, useMemo } from 'react';
import MetadataService from '../services/metadataService';

const MetadataContext = createContext(null);

export const useMetadata = () => {
  const ctx = useContext(MetadataContext);
  if (!ctx) {
    throw new Error('useMetadata debe usarse dentro de MetadataProvider');
  }
  return ctx;
};

export const MetadataProvider = ({ projectId, children }) => {
  const service = useMemo(() => {
    if (!projectId) return null;
    return new MetadataService(projectId);
  }, [projectId]);

  const value = useMemo(() => ({ service, projectId }), [service, projectId]);

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
};
