import { useState, useEffect, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';
import { RDI_STANDARDS } from '../constants/rdiStandards';

const normalizeRDI = (item) => {
  if (!item) return null;

  const normalizedStatus = item.status || item.estado || 'Abierta';
  const normalizedType = item.type || item.tipo || 'General';
  const normalizedLabel = item.label || item.etiqueta || 'General';

  return {
    ...item,
    id: item.id || item.guid || `rdi-${Date.now()}`,
    title: item.title || item.titulo || 'Sin título',
    description: item.description || item.comentario || item.descripcion || '',
    status: RDI_STANDARDS.statuses.includes(normalizedStatus) ? normalizedStatus : 'Abierta',
    type: RDI_STANDARDS.types.includes(normalizedType) ? normalizedType : 'General',
    label: RDI_STANDARDS.labels.includes(normalizedLabel) ? normalizedLabel : 'General',
    assignedTo: item.assignedTo || item.assigned_to || item.asignado_a || '',
    dueDate: item.dueDate || item.fecha || null,
    creationDate: item.creationDate || item.creation_date || item.createdAt || item.fecha || new Date().toISOString(),
    creationAuthor: item.creationAuthor || item.creation_author || item.autor || '',
    updatedAt: item.updatedAt || item.modified_date || item.fecha_modificacion || new Date().toISOString(),
    comments: (item.comments && Array.isArray(item.comments) && item.comments.length > 0)
      ? item.comments
      : (item.comentario ? [{
          guid: `c-legacy-${item.id || item.guid}`,
          comment: item.comentario,
          author: item.creationAuthor || item.creation_author || item.autor || 'Usuario',
          date: item.creationDate || item.creation_date || item.createdAt || item.fecha || new Date().toISOString()
        }] : [])
  };
};

const loadFromDB = (db) => new Promise((resolve, reject) => {
  if (!db || !db.objectStoreNames.contains('topics')) {
    resolve([]);
    return;
  }
  const transaction = db.transaction(['topics'], 'readonly');
  const store = transaction.objectStore('topics');
  const request = store.getAll();
  request.onsuccess = () => resolve(request.result || []);
  request.onerror = () => reject(request.error);
  transaction.onabort = () => resolve([]);
});

const saveToDB = (db, data) => new Promise((resolve, reject) => {
  if (!db) return reject(new Error('IndexedDB no disponible'));
  const transaction = db.transaction(['topics'], 'readwrite');
  const store = transaction.objectStore('topics');
  const request = store.add(data);
  request.onsuccess = () => resolve(data);
  request.onerror = () => reject(request.error);
});

const updateInDB = (db, id, data) => new Promise((resolve, reject) => {
  if (!db) return reject(new Error('IndexedDB no disponible'));
  const transaction = db.transaction(['topics'], 'readwrite');
  const store = transaction.objectStore('topics');
  const getRequest = store.get(id);
  getRequest.onsuccess = () => {
    const existing = getRequest.result;
    if (!existing) return reject(new Error(`RDI ${id} no encontrado`));
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    const putRequest = store.put(updated);
    putRequest.onsuccess = () => resolve(updated);
    putRequest.onerror = () => reject(putRequest.error);
  };
  getRequest.onerror = () => reject(getRequest.error);
});

const deleteFromDB = (db, id) => new Promise((resolve, reject) => {
  if (!db) return reject(new Error('IndexedDB no disponible'));
  const transaction = db.transaction(['topics'], 'readwrite');
  const store = transaction.objectStore('topics');
  const request = store.delete(id);
  request.onsuccess = () => resolve(true);
  request.onerror = () => reject(request.error);
});

const clearDB = (db) => new Promise((resolve, reject) => {
  if (!db) return reject(new Error('IndexedDB no disponible'));
  const transaction = db.transaction(['topics'], 'readwrite');
  const store = transaction.objectStore('topics');
  const request = store.clear();
  request.onsuccess = () => resolve(true);
  request.onerror = () => reject(request.error);
});

const collectAllIssues = async (metadataService) => {
  const all = await metadataService.getAllByProject();
  const issues = [];
  for (const el of all) {
    const elIssues = el.management?.issues || [];
    for (const issue of elIssues) {
      issues.push({ ...issue, _sourceGlobalId: el.globalId });
    }
  }
  return issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const useRDIManager = (db, { metadataService, selectedGuid } = {}) => {
  const [rdiList, setRdiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { trackRDIAction } = useAnalytics();

  // Determinar si usamos metadata service o legacy IndexedDB
  const useMetadata = !!metadataService;

  // Carga inicial (merge entre MetadataDB y legacy BCFDatabase)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let all = [];

        if (useMetadata) {
          const fromMetadata = await collectAllIssues(metadataService);
          all = fromMetadata;
        }

        if (db) {
          const fromLegacy = await loadFromDB(db);
          const legacyNormalized = (fromLegacy || []).map(normalizeRDI);
          // Merge: legacy tiene prioridad si el ID ya existe en metadata
          const existingIds = new Set(all.map((i) => i.id));
          for (const item of legacyNormalized) {
            if (!existingIds.has(item.id)) {
              all.push(item);
            }
          }
        }

        if (!cancelled) setRdiList(all.map(normalizeRDI));
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (useMetadata || db) load();
    else setLoading(false);
    return () => { cancelled = true; };
  }, [db, useMetadata, metadataService]);

  const loadRDIsFromDB = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      let all = [];

      if (useMetadata) {
        const fromMetadata = await collectAllIssues(metadataService);
        all = fromMetadata;
      }

      if (db) {
        const fromLegacy = await loadFromDB(db);
        const legacyNormalized = (fromLegacy || []).map(normalizeRDI);
        const existingIds = new Set(all.map((i) => i.id));
        for (const item of legacyNormalized) {
          if (!existingIds.has(item.id)) {
            all.push(item);
          }
        }
      }

      setRdiList(all.map(normalizeRDI));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [db, useMetadata, metadataService]);

  const getRDIByIdFromDB = useCallback(async (id) => {
    if (useMetadata) {
      const issues = await collectAllIssues(metadataService);
      const found = issues.find((i) => i.id === id);
      return normalizeRDI(found || null);
    }
    if (!db) return null;
    try {
      if (!db.objectStoreNames.contains('topics')) return null;
      const transaction = db.transaction(['topics'], 'readonly');
      const store = transaction.objectStore('topics');
      const request = store.get(id);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(normalizeRDI(request.result));
        request.onerror = () => resolve(null);
      });
    } catch { return null; }
  }, [db, useMetadata, metadataService]);

  const saveRDI = useCallback(async (formData, snapshotData = null) => {
    setLoading(true);
    setError(null);
    try {
      const rdiToSave = {
        ...formData,
        comments: formData.comments || [],
        id: formData.id || `rdi-${Date.now()}`,
        globalId: formData.globalId || selectedGuid || '',
        creationAuthor: formData.creationAuthor || 'signed.user@mail.com',
        creationDate: formData.creationDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        snapshot: snapshotData ? {
          imageData: snapshotData.imageData,
          viewpointData: snapshotData.viewpointData,
          createdAt: new Date().toISOString()
        } : (formData.snapshot || null)
      };

      if (useMetadata && rdiToSave.globalId) {
        await metadataService.addIssue(rdiToSave.globalId, rdiToSave);
      } else if (db) {
        await saveToDB(db, rdiToSave);
      }

      setRdiList(prev => [...prev, rdiToSave]);
      setLoading(false);
      return rdiToSave;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db, useMetadata, metadataService, selectedGuid]);

  const updateRDI = useCallback(async (id, updatedData, snapshotData = null, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      let updated;

      if (useMetadata) {
        const issues = await collectAllIssues(metadataService);
        const target = issues.find((i) => i.id === id);
        if (target) {
          await metadataService.updateIssue(target._sourceGlobalId, id, updatedData);
        }
      }

      // Fallback o primary: legacy BCFDatabase
      if (db) {
        const fromLegacy = await loadFromDB(db);
        const legacyTarget = (fromLegacy || []).find((i) => (i.id || i.guid) === id);
        if (legacyTarget) {
          await updateInDB(db, id, updatedData);
        } else if (!useMetadata) {
          throw new Error(`RDI ${id} no encontrado`);
        }
      }

      updated = { ...updatedData, id, updatedAt: new Date().toISOString() };
      setRdiList(prev => prev.map(rdi => rdi.id === id ? { ...rdi, ...updated } : rdi));
      setLoading(false);
      return updated;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db, useMetadata, metadataService]);

  const deleteRDI = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (useMetadata) {
        const issues = await collectAllIssues(metadataService);
        const target = issues.find((i) => i.id === id);
        if (target) {
          await metadataService.removeIssue(target._sourceGlobalId, id);
        }
      }
      if (db) {
        await deleteFromDB(db, id).catch(() => {});
      }
      setRdiList(prev => prev.filter(rdi => rdi.id !== id));
      setLoading(false);
      trackRDIAction('delete', id);
      return true;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db, useMetadata, metadataService]);

  const updateRDIStatus = useCallback(async (id, newStatus) => {
    return updateRDI(id, { status: newStatus });
  }, [updateRDI]);

  const getRDIById = useCallback((id) => {
    return rdiList.find(rdi => rdi.id === id);
  }, [rdiList]);

  const clearAllRDIs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMetadata) {
        const issues = await collectAllIssues(metadataService);
        for (const issue of issues) {
          await metadataService.removeIssue(issue._sourceGlobalId, issue.id).catch(() => {});
        }
      }
      if (db) {
        await clearDB(db).catch(() => {});
      }
      setRdiList([]);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db, useMetadata, metadataService]);

  const refreshRDIs = useCallback(() => {
    loadRDIsFromDB();
  }, [loadRDIsFromDB]);

  const getRDIStats = useCallback(() => {
    const total = rdiList.length;
    const byStatus = rdiList.reduce((acc, rdi) => {
      const status = rdi.status || 'Sin estado';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const byType = rdiList.reduce((acc, rdi) => {
      const type = rdi.type || 'Sin tipo';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return { total, byStatus, byType };
  }, [rdiList]);

  const convertRDIToBCFTopic = useCallback((rdiData) => {
    return {
      guid: rdiData.guid || rdiData.id,
      title: rdiData.title || 'Sin título',
      description: rdiData.description || '',
      topic_type: rdiData.type || 'General',
      topic_status: rdiData.status || 'Abierta',
      labels: rdiData.label ? [rdiData.label] : [],
      creation_date: rdiData.creationDate || new Date().toISOString(),
      modified_date: rdiData.updatedAt || new Date().toISOString(),
      due_date: rdiData.dueDate ? (rdiData.dueDate instanceof Date ? rdiData.dueDate.toISOString() : new Date(rdiData.dueDate).toISOString()) : null,
      assigned_to: rdiData.assignedTo || 'coordinacion@gmail.com',
      creation_author: rdiData.creationAuthor || 'signed.user@mail.com',
      stage: 'Diseño',
      priority: rdiData.priority || 'Media',
      index: rdiData.id,
      comments: rdiData.comments || []
    };
  }, []);

  const exportRDIToBCF = useCallback(async (rdiId) => {
    const rdi = getRDIById(rdiId);
    if (!rdi) throw new Error(`RDI con ID ${rdiId} no encontrado`);
    const bcfTopic = convertRDIToBCFTopic(rdi);
    const bcfData = { version: '3.0', topics: [bcfTopic], project: { name: 'Proyecto RDI', project_id: 'rdi-project' } };
    const jsonString = JSON.stringify(bcfData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RDI_${rdi.id}_${rdi.titulo || rdi.title}.bcf.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackRDIAction('export_individual_bcf', rdiId);
    return bcfTopic;
  }, [getRDIById, convertRDIToBCFTopic]);

  const exportAllRDIsToBCF = useCallback(async () => {
    if (rdiList.length === 0) throw new Error('No hay RDIs para exportar');
    const bcfTopics = rdiList.map(rdi => convertRDIToBCFTopic(rdi));
    const bcfData = {
      version: '3.0',
      topics: bcfTopics,
      project: { name: 'Proyecto RDI - Exportación Completa', project_id: 'rdi-project-full', creation_date: new Date().toISOString() },
      extensions: {
        topic_type: [...new Set(rdiList.map(rdi => rdi.type).filter(Boolean))],
        topic_status: [...new Set(rdiList.map(rdi => rdi.status).filter(Boolean))],
        topic_label: [...new Set(rdiList.map(rdi => rdi.label).filter(Boolean))],
        users: ['signed.user@mail.com', 'coordinacion@gmail.com']
      }
    };
    const jsonString = JSON.stringify(bcfData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Todos_los_RDIs_${new Date().toISOString().split('T')[0]}.bcf.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackRDIAction('export_all_bcf', 'multiple');
    return bcfData;
  }, [rdiList, convertRDIToBCFTopic]);

  return {
    rdiList,
    loading,
    error,
    saveRDI,
    updateRDI,
    deleteRDI,
    updateRDIStatus,
    getRDIByIdFromDB,
    getRDIById,
    clearAllRDIs,
    refreshRDIs,
    getRDIStats,
    loadRDIsFromDB,
    convertRDIToBCFTopic,
    exportRDIToBCF,
    exportAllRDIsToBCF,
  };
};
