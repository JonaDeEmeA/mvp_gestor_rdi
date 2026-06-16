import { useState, useEffect, useCallback, useRef } from 'react';
import IndexedDBProgressRepository from '../repositories/IndexedDBProgressRepository';
import {
  calculateWeightedProgress,
  calculateCompliance,
  buildGroupTree,
  calculateProjectKPIs,
} from '../services/progressCalculator';

export const useProgressManager = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const repoRef = useRef(null);

  if (!repoRef.current) {
    repoRef.current = new IndexedDBProgressRepository();
  }

  const repo = repoRef.current;

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await repo.getGroups();
      setGroups(result);
    } catch (err) {
      setError(err.message || 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const createGroup = useCallback(async (data) => {
    setError(null);
    try {
      const group = await repo.createGroup(data);
      setGroups((prev) => [...prev, group]);
      return group;
    } catch (err) {
      setError(err.message || 'Error al crear grupo');
      throw err;
    }
  }, []);

  const updateGroup = useCallback(async (id, data) => {
    setError(null);
    try {
      const updated = await repo.updateGroup(id, data);
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } catch (err) {
      setError(err.message || 'Error al actualizar grupo');
      throw err;
    }
  }, []);

  const deleteGroup = useCallback(async (id) => {
    setError(null);
    try {
      await repo.deleteGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar grupo');
      throw err;
    }
  }, []);

  const getGroupById = useCallback(
    (id) => groups.find((g) => g.id === id) || null,
    [groups]
  );

  const addElementToGroup = useCallback(async (groupId, ifcGuid, elementType = '') => {
    setError(null);
    try {
      return await repo.addElementToGroup(groupId, ifcGuid, elementType);
    } catch (err) {
      setError(err.message || 'Error al agregar elemento');
      throw err;
    }
  }, []);

  const removeElementFromGroup = useCallback(async (groupId, ifcGuid) => {
    setError(null);
    try {
      await repo.removeElementFromGroup(groupId, ifcGuid);
    } catch (err) {
      setError(err.message || 'Error al eliminar elemento');
      throw err;
    }
  }, []);

  const getElementsByGroup = useCallback(async (groupId) => {
    try {
      return await repo.getElementsByGroup(groupId);
    } catch (err) {
      setError(err.message || 'Error al obtener elementos');
      return [];
    }
  }, []);

  const getGroupsByElement = useCallback(async (ifcGuid) => {
    try {
      return await repo.getGroupsByElement(ifcGuid);
    } catch (err) {
      setError(err.message || 'Error al obtener grupos del elemento');
      return [];
    }
  }, []);

  const getSnapshotsByGroup = useCallback(async (groupId) => {
    try {
      return await repo.getSnapshotsByGroup(groupId);
    } catch (err) {
      setError(err.message || 'Error al obtener historial');
      return [];
    }
  }, []);

  const createSnapshot = useCallback(async (data) => {
    setError(null);
    try {
      const snapshot = await repo.createSnapshot(data);

      const latest = await repo.getLatestSnapshotByGroup(data.groupId);
      if (latest) {
        const updated = await repo.updateGroup(data.groupId, {
          progress: data.progress,
        });
        setGroups((prev) => prev.map((g) => (g.id === data.groupId ? updated : g)));
      }

      return snapshot;
    } catch (err) {
      setError(err.message || 'Error al registrar avance');
      throw err;
    }
  }, []);

  const addPhoto = useCallback(async (data) => {
    setError(null);
    try {
      return await repo.addPhoto(data);
    } catch (err) {
      setError(err.message || 'Error al agregar fotografía');
      throw err;
    }
  }, []);

  const getPhotosBySnapshot = useCallback(async (snapshotId) => {
    try {
      return await repo.getPhotosBySnapshot(snapshotId);
    } catch (err) {
      setError(err.message || 'Error al obtener fotografías');
      return [];
    }
  }, []);

  const weightedProgress = useCallback(() => {
    return calculateWeightedProgress(groups);
  }, [groups]);

  const compliance = useCallback(() => {
    const wp = calculateWeightedProgress(groups);
    const avgPlanned = groups.length > 0
      ? groups.reduce((s, g) => s + (g.plannedProgress ?? 0), 0) / groups.length
      : 0;
    return calculateCompliance(wp, avgPlanned);
  }, [groups]);

  const groupTree = useCallback(() => {
    return buildGroupTree(groups);
  }, [groups]);

  const projectKPIs = useCallback(async () => {
    const kpis = calculateProjectKPIs(groups);
    let totalElements = 0;
    for (const group of groups) {
      const elements = await repo.getElementsByGroup(group.id);
      totalElements += elements.length;
    }
    return { ...kpis, totalElements };
  }, [groups]);

  const getChildGroups = useCallback(async (parentId) => {
    try {
      return await repo.getChildGroups(parentId);
    } catch (err) {
      setError(err.message || 'Error al obtener subgrupos');
      return [];
    }
  }, []);

  const getRootGroups = useCallback(async () => {
    try {
      return await repo.getRootGroups();
    } catch (err) {
      setError(err.message || 'Error al obtener grupos raíz');
      return [];
    }
  }, []);

  return {
    groups,
    loading,
    error,
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
    addElementToGroup,
    removeElementFromGroup,
    getElementsByGroup,
    getGroupsByElement,
    getSnapshotsByGroup,
    createSnapshot,
    addPhoto,
    getPhotosBySnapshot,
    weightedProgress,
    compliance,
    groupTree,
    projectKPIs,
    getChildGroups,
    getRootGroups,
  };
};
