import { useState, useEffect, useCallback } from 'react';

const emptyData = (globalId) => ({
  globalId,
  exists: false,
  classification: { chapter: '', subchapter: '', specialty: '', discipline: '' },
  contractual: { responsible: '', company: '', contract: '', isCriticalPath: false },
  production: { progressGroupId: null, weight: 1.0, weightUnit: 'porcentaje', unit: '', quantity: 0, progress: 0, plannedProgress: 0 },
  economic: { cost: 0, budget: 0, manHours: 0, economicWeight: 0 },
  issues: [],
  observations: [],
  photos: [],
  documents: [],
  history: [],
  kpis: {},
  analyticalSnapshots: [],
  elementStatus: 'active',
  syncStatus: null,
  ifcVersionId: null,
});

export const useElementDashboard = (metadataService, globalId) => {
  const [data, setData] = useState(() => emptyData(globalId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!metadataService || !globalId) {
      setData(emptyData(globalId));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const md = await metadataService.getByGlobalId(globalId);

      if (!md) {
        setData(emptyData(globalId));
        setLoading(false);
        return;
      }

      setData({
        globalId: md.globalId,
        exists: true,
        classification: md.classification || emptyData(globalId).classification,
        contractual: md.contractual || emptyData(globalId).contractual,
        production: md.production || emptyData(globalId).production,
        economic: md.economic || emptyData(globalId).economic,
        issues: md.management?.issues || [],
        observations: md.management?.observations || [],
        photos: md.management?.photos || [],
        documents: md.management?.documents || [],
        history: (md.management?.history || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        kpis: md.analytical?.kpis || {},
        analyticalSnapshots: (md.analytical?.snapshots || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        elementStatus: md.elementStatus || 'active',
        syncStatus: md.syncStatus || null,
        ifcVersionId: md.ifcVersionId || null,
      });
    } catch (err) {
      console.error('[useElementDashboard] Error:', err);
      setError(err);
      setData(emptyData(globalId));
    } finally {
      setLoading(false);
    }
  }, [metadataService, globalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasData = data.exists;
  const totalIssues = data.issues.length;
  const openIssues = data.issues.filter((i) => i.status === 'Abierta' || i.status === 'Pendiente').length;
  const totalPhotos = data.photos.length;
  const totalDocs = data.documents.length;

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    hasData,
    totalIssues,
    openIssues,
    totalPhotos,
    totalDocs,
  };
};
