import { useState, useCallback, useRef } from 'react';
import IndexedDBProgressRepository from '../repositories/IndexedDBProgressRepository';

export const useProgressSnapshots = (groupId, onProgressUpdate) => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const repoRef = useRef(null);

  if (!repoRef.current) {
    repoRef.current = new IndexedDBProgressRepository();
  }

  const repo = repoRef.current;

  const loadSnapshots = useCallback(async (targetGroupId) => {
    const gid = targetGroupId || groupId;
    if (!gid) return;
    setLoading(true);
    setError(null);
    try {
      const result = await repo.getSnapshotsByGroup(gid);
      setSnapshots(result);
    } catch (err) {
      setError(err.message || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const addSnapshot = useCallback(async (progress, comment) => {
    if (!groupId) throw new Error('No hay grupo seleccionado');
    setError(null);
    try {
      const snapshot = await repo.createSnapshot({
        groupId,
        progress,
        comment: comment || '',
      });

      const latest = await repo.getLatestSnapshotByGroup(groupId);
      if (latest && onProgressUpdate) {
        await onProgressUpdate(groupId, progress);
      }

      setSnapshots((prev) => [snapshot, ...prev]);
      return snapshot;
    } catch (err) {
      setError(err.message || 'Error al registrar avance');
      throw err;
    }
  }, [groupId, onProgressUpdate]);

  return {
    snapshots,
    loading,
    error,
    loadSnapshots,
    addSnapshot,
  };
};

export default useProgressSnapshots;
