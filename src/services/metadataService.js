import IndexedDBMetadataRepository from '../repositories/IndexedDBMetadataRepository';

const now = () => new Date().toISOString();

class MetadataService {
  constructor(projectId) {
    if (!projectId) throw new Error('MetadataService requires projectId');

    this.projectId = projectId;

    // MVP: Solo IndexedDB. FIRESTORE: agregar FirestoreMetadataRepository como _remote
    this._local = new IndexedDBMetadataRepository(projectId);
    // this._remote = null; // FIRESTORE: new FirestoreMetadataRepository(projectId)

    this._syncEnabled = false;
    this._pendingSync = [];
    this._online = navigator.onLine;
  }

  // ─── Sync queue ───────────────────────────────────────────────

  _enqueue(operation, globalId, data = null) {
    this._pendingSync.push({
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      operation,
      globalId,
      data,
      createdAt: now(),
      status: 'pending',
    });
    // FIRESTORE: persistir _pendingSync a IndexedDB para recovery entre sesiones
  }

  getSyncQueue() {
    return [...this._pendingSync];
  }

  getPendingCount() {
    return this._pendingSync.filter((s) => s.status === 'pending').length;
  }

  // FIRESTORE: procesar cola cuando se recupere conectividad
  // async processSyncQueue() { for (const item of this._pendingSync) { ... } }

  isOnline() {
    return this._online;
  }

  // ─── Metadata CRUD ────────────────────────────────────────────

  async getByGlobalId(globalId) {
    // MVP: local. FIRESTORE: intentar _remote primero, fallback a _local
    return this._local.getByGlobalId(globalId);
  }

  async getByGlobalIds(globalIds) {
    return this._local.getByGlobalIds(globalIds);
  }

  async save(globalId, data = {}) {
    const result = await this._local.save(globalId, data);
    const entry = this._local.getByGlobalId(globalId);
    // FIRESTORE: await this._remote.save(globalId, data)
    this._enqueue('save', globalId, data);
    return result;
  }

  async update(globalId, updates) {
    const result = await this._local.update(globalId, updates);
    // FIRESTORE: await this._remote.update(globalId, updates)
    this._enqueue('update', globalId, updates);
    return result;
  }

  async delete(globalId) {
    await this._local.delete(globalId);
    // FIRESTORE: await this._remote.delete(globalId)
    this._enqueue('delete', globalId);
    return true;
  }

  async getAllByProject() {
    return this._local.getAllByProject();
  }

  async getAllByIfcVersion(ifcVersionId) {
    return this._local.getAllByIfcVersion(ifcVersionId);
  }

  async getByElementStatus(elementStatus) {
    return this._local.getByElementStatus(elementStatus);
  }

  async count() {
    return this._local.count();
  }

  // ─── Sincronización de versiones IFC ──────────────────────────

  async getAllGlobalIds() {
    return this._local.getAllGlobalIds();
  }

  async batchUpdateSyncStatus(updates) {
    const result = await this._local.batchUpdateSyncStatus(updates);
    // FIRESTORE: await this._remote.batchUpdateSyncStatus(updates)
    return result;
  }

  // ─── Clasificación ────────────────────────────────────────────

  async getByClassification(field, value) {
    return this._local.getByClassification(field, value);
  }

  async getBySpecialty(specialty) {
    return this._local.getBySpecialty(specialty);
  }

  async getByDiscipline(discipline) {
    return this._local.getByDiscipline(discipline);
  }

  async getByChapter(chapter) {
    return this._local.getByChapter(chapter);
  }

  // ─── Contractual ──────────────────────────────────────────────

  async getByResponsible(responsible) {
    return this._local.getByResponsible(responsible);
  }

  async getByCompany(company) {
    return this._local.getByCompany(company);
  }

  async getCriticalPathElements() {
    return this._local.getCriticalPathElements();
  }

  // ─── Producción / Avance ──────────────────────────────────────

  async getByProgressGroup(progressGroupId) {
    return this._local.getByProgressGroup(progressGroupId);
  }

  async getByProgressRange(min, max) {
    return this._local.getByProgressRange(min, max);
  }

  async updateProductionData(globalId, productionData) {
    const result = await this._local.updateProductionData(globalId, productionData);
    // FIRESTORE: await this._remote.updateProductionData(globalId, productionData)
    this._enqueue('updateProduction', globalId, productionData);
    return result;
  }

  // ─── Económico ────────────────────────────────────────────────

  async getByBudgetRange(min, max) {
    return this._local.getByBudgetRange(min, max);
  }

  async updateEconomicData(globalId, economicData) {
    const result = await this._local.updateEconomicData(globalId, economicData);
    // FIRESTORE: await this._remote.updateEconomicData(globalId, economicData)
    this._enqueue('updateEconomic', globalId, economicData);
    return result;
  }

  // ─── Incidencias ──────────────────────────────────────────────

  async addIssue(globalId, issueData) {
    const result = await this._local.addIssue(globalId, issueData);
    // FIRESTORE: await this._remote.addIssue(globalId, issueData)
    this._enqueue('addIssue', globalId, issueData);
    return result;
  }

  async updateIssue(globalId, issueId, updates) {
    const result = await this._local.updateIssue(globalId, issueId, updates);
    // FIRESTORE: await this._remote.updateIssue(globalId, issueId, updates)
    this._enqueue('updateIssue', globalId, { issueId, ...updates });
    return result;
  }

  async removeIssue(globalId, issueId) {
    await this._local.removeIssue(globalId, issueId);
    // FIRESTORE: await this._remote.removeIssue(globalId, issueId)
    this._enqueue('removeIssue', globalId, { issueId });
    return true;
  }

  async getIssuesByGlobalId(globalId) {
    return this._local.getIssuesByGlobalId(globalId);
  }

  async getIssuesByStatus(status) {
    return this._local.getIssuesByStatus(status);
  }

  async getIssuesByType(type) {
    return this._local.getIssuesByType(type);
  }

  async addObservation(globalId, observation) {
    const result = await this._local.addObservation(globalId, observation);
    // FIRESTORE: await this._remote.addObservation(globalId, observation)
    return result;
  }

  async removeObservation(globalId, observationId) {
    await this._local.removeObservation(globalId, observationId);
    // FIRESTORE: await this._remote.removeObservation(globalId, observationId)
    return true;
  }

  // ─── Fotografías ──────────────────────────────────────────────

  async addPhoto(globalId, photoData) {
    const result = await this._local.addPhoto(globalId, photoData);
    // FIRESTORE: await this._remote.addPhoto(globalId, photoData)
    this._enqueue('addPhoto', globalId, photoData);
    return result;
  }

  async removePhoto(globalId, photoId) {
    await this._local.removePhoto(globalId, photoId);
    // FIRESTORE: await this._remote.removePhoto(globalId, photoId)
    this._enqueue('removePhoto', globalId, { photoId });
    return true;
  }

  async getPhotosByGlobalId(globalId) {
    return this._local.getPhotosByGlobalId(globalId);
  }

  // ─── Documentos ───────────────────────────────────────────────

  async addDocument(globalId, documentData) {
    const result = await this._local.addDocument(globalId, documentData);
    // FIRESTORE: await this._remote.addDocument(globalId, documentData)
    this._enqueue('addDocument', globalId, documentData);
    return result;
  }

  async removeDocument(globalId, documentId) {
    await this._local.removeDocument(globalId, documentId);
    // FIRESTORE: await this._remote.removeDocument(globalId, documentId)
    this._enqueue('removeDocument', globalId, { documentId });
    return true;
  }

  async getDocumentsByGlobalId(globalId) {
    return this._local.getDocumentsByGlobalId(globalId);
  }

  // ─── Historial ────────────────────────────────────────────────

  async addHistoryEntry(globalId, entryData) {
    const result = await this._local.addHistoryEntry(globalId, entryData);
    // FIRESTORE: await this._remote.addHistoryEntry(globalId, entryData)
    return result;
  }

  async getHistoryByGlobalId(globalId) {
    return this._local.getHistoryByGlobalId(globalId);
  }

  // ─── Analítico ────────────────────────────────────────────────

  async updateAnalyticalData(globalId, analyticalData) {
    const result = await this._local.updateAnalyticalData(globalId, analyticalData);
    // FIRESTORE: await this._remote.updateAnalyticalData(globalId, analyticalData)
    return result;
  }

  async addAnalyticalSnapshot(globalId, snapshotData) {
    const result = await this._local.addAnalyticalSnapshot(globalId, snapshotData);
    // FIRESTORE: await this._remote.addAnalyticalSnapshot(globalId, snapshotData)
    this._enqueue('addAnalyticalSnapshot', globalId, snapshotData);
    return result;
  }

  async getAnalyticalSnapshotsByGlobalId(globalId) {
    return this._local.getAnalyticalSnapshotsByGlobalId(globalId);
  }

  async getAnalyticalSnapshotsByGroup(progressGroupId) {
    return this._local.getAnalyticalSnapshotsByGroup(progressGroupId);
  }

  async getKPIByGlobalId(globalId) {
    return this._local.getKPIByGlobalId(globalId);
  }

  // ─── Batch ────────────────────────────────────────────────────

  async bulkSave(items) {
    const count = await this._local.bulkSave(items);
    // FIRESTORE: await this._remote.bulkSave(items)
    for (const item of items) {
      this._enqueue('save', item.globalId, item);
    }
    return count;
  }

  async bulkUpdate(updates) {
    const count = await this._local.bulkUpdate(updates);
    // FIRESTORE: await this._remote.bulkUpdate(updates)
    return count;
  }

  async bulkDelete(globalIds) {
    const count = await this._local.bulkDelete(globalIds);
    // FIRESTORE: await this._remote.bulkDelete(globalIds)
    for (const globalId of globalIds) {
      this._enqueue('delete', globalId);
    }
    return count;
  }

  // ─── FIRESTORE: Métodos que se activarán en producción ─────────
  //
  // enableSync() {
  //   this._remote = new FirestoreMetadataRepository(this.projectId);
  //   this._syncEnabled = true;
  // }
  //
  // disableSync() {
  //   this._remote = null;
  //   this._syncEnabled = false;
  // }
  //
  // async processSyncQueue() {
  //   if (!this._remote) return;
  //   const pending = this._pendingSync.filter(s => s.status === 'pending');
  //   for (const item of pending) {
  //     try {
  //       switch (item.operation) {
  //         case 'save':
  //           await this._remote.save(item.globalId, item.data);
  //           break;
  //         case 'update':
  //           await this._remote.update(item.globalId, item.data);
  //           break;
  //         case 'delete':
  //           await this._remote.delete(item.globalId);
  //           break;
  //         // ... resto de operaciones
  //       }
  //       item.status = 'synced';
  //     } catch (e) {
  //       item.status = 'failed';
  //       console.error('Sync failed for', item.globalId, e);
  //     }
  //   }
  // }
  //
  // Al activar sync dual:
  //   Cada método write debe llamar _local._operacion() Y _remote._operacion()
  //   En lugar de encolar, se ejecuta en paralelo con fallback a _local.
}

export default MetadataService;
