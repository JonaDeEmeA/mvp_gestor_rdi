import { ELEMENT_STATUS, SYNC_STATUS, HISTORY_ACTIONS } from '../constants/metadataStandards';

let _counter = 0;
const nextVersionId = () => {
  _counter++;
  const date = new Date().toISOString().split('T')[0];
  return `v${_counter}-${date}`;
};

const summarize = (results) => ({
  total: results.length,
  conserved: results.filter((r) => r.syncStatus === SYNC_STATUS.CONSERVED).length,
  newElements: results.filter((r) => r.syncStatus === SYNC_STATUS.NEW).length,
  deleted: results.filter((r) => r.syncStatus === SYNC_STATUS.DELETED).length,
});

export const syncIfcVersion = async (metadataService, newGuids, options = {}) => {
  const ifcVersionId = options.ifcVersionId || nextVersionId();

  if (!newGuids || newGuids.length === 0) {
    return { ifcVersionId, changes: [], summary: { total: 0, conserved: 0, newElements: 0, deleted: 0 } };
  }

  const newGuidSet = new Set(newGuids);
  const existingGuids = await metadataService.getAllGlobalIds();
  const existingGuidSet = new Set(existingGuids);

  const changes = [];

  // 1. Elementos Conservados: GUID existe en ambos
  for (const guid of newGuids) {
    if (existingGuidSet.has(guid)) {
      changes.push({ globalId: guid, syncStatus: SYNC_STATUS.CONSERVED, ifcVersionId });
    }
  }

  // 2. Elementos Nuevos: GUID solo en el nuevo IFC
  for (const guid of newGuids) {
    if (!existingGuidSet.has(guid)) {
      changes.push({ globalId: guid, syncStatus: SYNC_STATUS.NEW, ifcVersionId });
    }
  }

  // 3. Elementos Eliminados: GUID solo en el repositorio
  for (const guid of existingGuids) {
    if (!newGuidSet.has(guid)) {
      changes.push({ globalId: guid, syncStatus: SYNC_STATUS.DELETED, ifcVersionId });
    }
  }

  // Actualizar syncStatus en el repositorio (batch)
  const batchUpdates = [];
  for (const change of changes) {
    if (change.syncStatus === SYNC_STATUS.CONSERVED) {
      batchUpdates.push({ globalId: change.globalId, syncStatus: SYNC_STATUS.CONSERVED, ifcVersionId });
    } else if (change.syncStatus === SYNC_STATUS.NEW) {
      // Crear metadata vacía para elementos nuevos
      await metadataService.save(change.globalId, {
        ifcVersionId,
        syncStatus: SYNC_STATUS.NEW,
      });
      // Agregar entrada al historial
      try {
        await metadataService.addHistoryEntry(change.globalId, {
          action: HISTORY_ACTIONS.IFC_VERSION_CHANGED,
          description: `Elemento nuevo detectado en version ${ifcVersionId}`,
          author: options.author || 'sistema',
        });
      } catch { /* metadata recién creado, history puede no estar disponible */ }
    } else if (change.syncStatus === SYNC_STATUS.DELETED) {
      batchUpdates.push({ globalId: change.globalId, syncStatus: SYNC_STATUS.DELETED, ifcVersionId });
      try {
        const md = await metadataService.getByGlobalId(change.globalId);
        if (md && md.elementStatus !== ELEMENT_STATUS.OBSOLETE) {
          await metadataService.update(change.globalId, {
            elementStatus: ELEMENT_STATUS.OBSOLETE,
          });
          await metadataService.addHistoryEntry(change.globalId, {
            action: HISTORY_ACTIONS.MARKED_OBSOLETE,
            description: `Elemento marcado como obsoleto en version ${ifcVersionId}`,
            author: options.author || 'sistema',
          });
        }
      } catch { /* sigue adelante */ }
    }
  }

  // Batch update sync status para conservados y eliminados
  if (batchUpdates.length > 0) {
    await metadataService.batchUpdateSyncStatus(batchUpdates);
  }

  const summary = summarize(changes);

  return { ifcVersionId, changes, summary };
};

export const getSyncSummaryText = (summary) => {
  if (!summary || summary.total === 0) return 'No hay elementos para sincronizar';
  const parts = [];
  if (summary.conserved > 0) parts.push(`${summary.conserved} conservados`);
  if (summary.newElements > 0) parts.push(`${summary.newElements} nuevos`);
  if (summary.deleted > 0) parts.push(`${summary.deleted} eliminados`);
  return `Sincronización ${summary.total > 0 ? `(${parts.join(', ')})` : ''}`;
};

export default syncIfcVersion;
