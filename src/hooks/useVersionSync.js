import { useState, useCallback } from 'react';
import { syncIfcVersion } from '../services/versionSyncService';
import { getGuidMap } from '../services/guidMapService';

export const useVersionSync = (metadataService) => {
  const [syncSummary, setSyncSummary] = useState(null);
  const [ifcVersionId, setIfcVersionId] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const runSync = useCallback(async () => {
    if (!metadataService) return;

    setSyncing(true);
    try {
      const guidMap = getGuidMap();
      const newGuids = guidMap.getAllGuids();

      if (newGuids.length === 0) {
        console.warn('[useVersionSync] No hay GUIDs cargados en el visor');
        setSyncing(false);
        return;
      }

      const result = await syncIfcVersion(metadataService, newGuids, {
        author: 'sistema',
      });

      setSyncSummary(result.summary);
      setIfcVersionId(result.ifcVersionId);
      setLastSyncTime(new Date().toLocaleString());
      setSyncing(false);

      console.log('[useVersionSync] Sincronización completada:', result.summary);
      return result;
    } catch (err) {
      console.error('[useVersionSync] Error en sincronización:', err);
      setSyncing(false);
    }
  }, [metadataService]);

  const resetSync = useCallback(() => {
    setSyncSummary(null);
    setIfcVersionId(null);
    setLastSyncTime(null);
  }, []);

  return {
    syncSummary,
    ifcVersionId,
    lastSyncTime,
    syncing,
    runSync,
    resetSync,
  };
};
