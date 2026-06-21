import { getDB, STORES } from '../database/MetadataDB.js';
import {
  createEmptyMetadata,
  createIssue,
  createPhoto,
  createDocument,
  createHistoryEntry,
  createAnalyticalSnapshot,
  validateMetadata,
} from '../constants/metadataStandards.js';

const now = () => new Date().toISOString();

const executeTransaction = async (storeName, mode, callback) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    callback(store, resolve, reject, transaction);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(new Error('Transaction aborted'));
  });
};

const executeDualTransaction = async (storeNames, mode, callback) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames, mode);
    callback(transaction, resolve, reject);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(new Error('Transaction aborted'));
  });
};

const getAllFromIndex = async (storeName, indexName, value) => {
  return executeTransaction(storeName, 'readonly', (store, resolve) => {
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result || []);
  });
};

class IndexedDBMetadataRepository {
  constructor(projectId) {
    this.projectId = projectId;
  }

  async getByGlobalId(globalId) {
    return executeTransaction(STORES.METADATA, 'readonly', (store, resolve) => {
      const request = store.get(globalId);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getByGlobalIds(globalIds) {
    if (!globalIds.length) return [];
    return executeTransaction(STORES.METADATA, 'readonly', (store, resolve) => {
      const results = [];
      let completed = 0;
      for (const id of globalIds) {
        const request = store.get(id);
        request.onsuccess = () => {
          if (request.result) results.push(request.result);
          completed++;
          if (completed === globalIds.length) resolve(results);
        };
        request.onerror = () => {
          completed++;
          if (completed === globalIds.length) resolve(results);
        };
      }
    });
  }

  async save(globalId, data = {}) {
    const metadata = createEmptyMetadata(globalId, {
      ...data,
      projectId: this.projectId,
    });
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const request = store.add(metadata);
      request.onsuccess = () => resolve(metadata);
      request.onerror = () => reject(request.error);
    });
  }

  async update(globalId, updates) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        const updated = {
          ...existing,
          ...updates,
          globalId,
          updatedAt: now(),
        };
        delete updated.createdAt;
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async delete(globalId) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const request = store.delete(globalId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByProject() {
    return executeTransaction(STORES.METADATA, 'readonly', (store, resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result || [];
        resolve(all.filter((el) => el.projectId === this.projectId));
      };
    });
  }

  async getAllByIfcVersion(ifcVersionId) {
    return getAllFromIndex(STORES.METADATA, 'ifcVersionId', ifcVersionId);
  }

  async getByElementStatus(elementStatus) {
    return getAllFromIndex(STORES.METADATA, 'elementStatus', elementStatus);
  }

  async count() {
    return executeTransaction(STORES.METADATA, 'readonly', (store, resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllGlobalIds() {
    return executeTransaction(STORES.METADATA, 'readonly', (store, resolve) => {
      const results = [];
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.key);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }

  async batchUpdateSyncStatus(updates) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      let completed = 0;
      const total = updates.length;
      for (const { globalId, syncStatus, ifcVersionId } of updates) {
        const getRequest = store.get(globalId);
        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          if (existing) {
            existing.syncStatus = syncStatus;
            existing.ifcVersionId = ifcVersionId;
            existing.updatedAt = now();
            store.put(existing);
          }
          completed++;
          if (completed === total) resolve(true);
        };
        getRequest.onerror = () => {
          completed++;
          if (completed === total) resolve(true);
        };
      }
    });
  }

  async getByClassification(field, value) {
    const indexMap = {
      specialty: 'specialty',
      discipline: 'discipline',
      chapter: 'chapter',
    };
    const indexName = indexMap[field];
    if (!indexName) return [];
    return getAllFromIndex(STORES.METADATA, indexName, value);
  }

  async getBySpecialty(specialty) {
    return this.getByClassification('specialty', specialty);
  }

  async getByDiscipline(discipline) {
    return this.getByClassification('discipline', discipline);
  }

  async getByChapter(chapter) {
    return this.getByClassification('chapter', chapter);
  }

  async getByResponsible(responsible) {
    return getAllFromIndex(STORES.METADATA, 'responsible', responsible);
  }

  async getByCompany(company) {
    return getAllFromIndex(STORES.METADATA, 'company', company);
  }

  async getCriticalPathElements() {
    return getAllFromIndex(STORES.METADATA, 'isCriticalPath', true);
  }

  async getByProgressGroup(progressGroupId) {
    return getAllFromIndex(STORES.METADATA, 'progressGroupId', progressGroupId);
  }

  async getByProgressRange(min, max) {
    const all = await this.getAllByProject();
    return all.filter((el) => {
      const p = el.production?.progress ?? 0;
      return p >= min && p <= max;
    });
  }

  async updateProductionData(globalId, productionData) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.production = { ...existing.production, ...productionData };
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(existing);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async getByBudgetRange(min, max) {
    const all = await this.getAllByProject();
    return all.filter((el) => {
      const b = el.economic?.budget ?? 0;
      return b >= min && b <= max;
    });
  }

  async updateEconomicData(globalId, economicData) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.economic = { ...existing.economic, ...economicData };
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(existing);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async addIssue(globalId, issueData) {
    const issue = createIssue({ ...issueData, globalId });
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management = existing.management || {};
        existing.management.issues = [...(existing.management.issues || []), issue];
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(issue);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async updateIssue(globalId, issueId, updates) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        const issues = (existing.management?.issues || []).map((i) =>
          i.id === issueId ? { ...i, ...updates, updatedAt: now() } : i
        );
        existing.management.issues = issues;
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(issues.find((i) => i.id === issueId));
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async removeIssue(globalId, issueId) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.issues = (existing.management?.issues || []).filter((i) => i.id !== issueId);
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async getIssuesByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return metadata?.management?.issues || [];
  }

  async getIssuesByStatus(status) {
    const all = await this.getAllByProject();
    const results = [];
    for (const el of all) {
      const matched = (el.management?.issues || []).filter((i) => i.status === status);
      for (const issue of matched) {
        results.push({ ...issue, _globalId: el.globalId });
      }
    }
    return results;
  }

  async getIssuesByType(type) {
    const all = await this.getAllByProject();
    const results = [];
    for (const el of all) {
      const matched = (el.management?.issues || []).filter((i) => i.type === type);
      for (const issue of matched) {
        results.push({ ...issue, _globalId: el.globalId });
      }
    }
    return results;
  }

  async addObservation(globalId, observation) {
    const entry = { id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, ...observation, createdAt: now() };
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.observations = [...(existing.management?.observations || []), entry];
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(entry);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async removeObservation(globalId, observationId) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.observations = (existing.management?.observations || []).filter((o) => o.id !== observationId);
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async addPhoto(globalId, photoData) {
    const photo = createPhoto({ ...photoData, globalId });
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.photos = [...(existing.management?.photos || []), photo];
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(photo);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async removePhoto(globalId, photoId) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.photos = (existing.management?.photos || []).filter((p) => p.id !== photoId);
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async getPhotosByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return metadata?.management?.photos || [];
  }

  async addDocument(globalId, documentData) {
    const document = createDocument({ ...documentData, globalId });
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.documents = [...(existing.management?.documents || []), document];
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(document);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async removeDocument(globalId, documentId) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.documents = (existing.management?.documents || []).filter((d) => d.id !== documentId);
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async getDocumentsByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return metadata?.management?.documents || [];
  }

  async addHistoryEntry(globalId, entryData) {
    const entry = createHistoryEntry({ ...entryData, globalId });
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.management.history = [...(existing.management?.history || []), entry];
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(entry);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async getHistoryByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return (metadata?.management?.history || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async updateAnalyticalData(globalId, analyticalData) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.analytical = { ...existing.analytical, ...analyticalData };
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(existing);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async addAnalyticalSnapshot(globalId, snapshotData) {
    const snapshot = createAnalyticalSnapshot({ ...snapshotData, globalId });
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      const getRequest = store.get(globalId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Metadata not found: ${globalId}`));
          return;
        }
        existing.analytical.snapshots = [...(existing.analytical?.snapshots || []), snapshot];
        existing.updatedAt = now();
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve(snapshot);
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  async getAnalyticalSnapshotsByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return (metadata?.analytical?.snapshots || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async getAnalyticalSnapshotsByGroup(progressGroupId) {
    const elements = await this.getByProgressGroup(progressGroupId);
    const allSnapshots = [];
    for (const el of elements) {
      const snaps = el.analytical?.snapshots || [];
      for (const s of snaps) {
        allSnapshots.push({ ...s, _globalId: el.globalId });
      }
    }
    return allSnapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getKPIByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return metadata?.analytical?.kpis || {};
  }

  async bulkSave(items) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      let completed = 0;
      const total = items.length;
      for (const item of items) {
        const { globalId, ...data } = item;
        const metadata = createEmptyMetadata(globalId, { ...data, projectId: this.projectId });
        const request = store.add(metadata);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve(total);
        };
        request.onerror = () => {
          completed++;
          if (completed === total) resolve(total);
        };
      }
    });
  }

  async bulkUpdate(updates) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      let completed = 0;
      const total = updates.length;
      for (const { globalId, ...data } of updates) {
        const getRequest = store.get(globalId);
        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          if (existing) {
            const updated = { ...existing, ...data, globalId, updatedAt: now() };
            delete updated.createdAt;
            store.put(updated);
          }
          completed++;
          if (completed === total) resolve(total);
        };
        getRequest.onerror = () => {
          completed++;
          if (completed === total) resolve(total);
        };
      }
    });
  }

  async bulkDelete(globalIds) {
    return executeTransaction(STORES.METADATA, 'readwrite', (store, resolve, reject) => {
      let completed = 0;
      const total = globalIds.length;
      for (const globalId of globalIds) {
        const request = store.delete(globalId);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve(total);
        };
        request.onerror = () => {
          completed++;
          if (completed === total) resolve(total);
        };
      }
    });
  }
}

export default IndexedDBMetadataRepository;
