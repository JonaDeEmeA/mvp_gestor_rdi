import { db } from '../config/firebase.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import {
  createEmptyMetadata,
  createIssue,
  createComment,
  createPhoto,
  createDocument,
  createHistoryEntry,
  createAnalyticalSnapshot,
  validateMetadata,
  ELEMENT_STATUS,
  SYNC_STATUS,
} from '../constants/metadataStandards.js';

const now = () => new Date().toISOString();

const deserializeDates = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deserializeDates);
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else if (typeof value === 'object' && value !== null) {
      result[key] = deserializeDates(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

const toPlainObject = (snap) => {
  if (!snap.exists()) return null;
  const data = snap.data();
  return deserializeDates(data);
};

class FirestoreMetadataRepository {
  constructor(projectId) {
    if (!projectId) throw new Error('FirestoreMetadataRepository requires projectId');
    this.projectId = projectId;
    this._collectionRef = collection(db, 'projects', projectId, 'elements');
  }

  _docRef(globalId) {
    return doc(this._collectionRef, globalId);
  }

  async getByGlobalId(globalId) {
    const snap = await getDoc(this._docRef(globalId));
    return toPlainObject(snap);
  }

  async getByGlobalIds(globalIds) {
    if (!globalIds.length) return [];
    const results = [];
    const batchSize = 30;
    for (let i = 0; i < globalIds.length; i += batchSize) {
      const chunk = globalIds.slice(i, i + batchSize);
      const q = query(this._collectionRef, where('__name__', 'in', chunk));
      const snap = await getDocs(q);
      snap.forEach((d) => results.push(toPlainObject(d)));
    }
    return results;
  }

  async save(globalId, data = {}) {
    const metadata = createEmptyMetadata(globalId, {
      ...data,
      projectId: this.projectId,
    });
    const ref = this._docRef(globalId);
    await setDoc(ref, { ...metadata, createdAt: Timestamp.fromDate(new Date(metadata.createdAt)), updatedAt: Timestamp.fromDate(new Date()) });
    return { ...metadata, globalId };
  }

  async update(globalId, updates) {
    const ref = this._docRef(globalId);
    const payload = { ...updates, updatedAt: Timestamp.fromDate(new Date()) };
    delete payload.globalId;
    delete payload.createdAt;
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return toPlainObject(snap);
  }

  async delete(globalId) {
    await deleteDoc(this._docRef(globalId));
    return true;
  }

  async getAllByProject() {
    const snap = await getDocs(this._collectionRef);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
  }

  async getAllByIfcVersion(ifcVersionId) {
    const q = query(this._collectionRef, where('ifcVersionId', '==', ifcVersionId));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
  }

  async getByElementStatus(elementStatus) {
    const q = query(this._collectionRef, where('elementStatus', '==', elementStatus));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
  }

  async count() {
    const snap = await getDocs(this._collectionRef);
    return snap.size;
  }

  async getAllGlobalIds() {
    const snap = await getDocs(this._collectionRef);
    const ids = [];
    snap.forEach((d) => ids.push(d.id));
    return ids;
  }

  async batchUpdateSyncStatus(updates) {
    const batch = writeBatch(db);
    for (const { globalId, syncStatus, ifcVersionId } of updates) {
      const ref = this._docRef(globalId);
      batch.update(ref, { syncStatus, ifcVersionId, updatedAt: Timestamp.fromDate(new Date()) });
    }
    await batch.commit();
    return true;
  }

  async getByClassification(field, value) {
    const q = query(this._collectionRef, where(`classification.${field}`, '==', value));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
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
    const q = query(this._collectionRef, where('contractual.responsible', '==', responsible));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
  }

  async getByCompany(company) {
    const q = query(this._collectionRef, where('contractual.company', '==', company));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
  }

  async getCriticalPathElements() {
    const q = query(this._collectionRef, where('contractual.isCriticalPath', '==', true));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
  }

  async getByProgressGroup(progressGroupId) {
    const q = query(this._collectionRef, where('production.progressGroupId', '==', progressGroupId));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((d) => results.push(toPlainObject(d)));
    return results;
  }

  async getByProgressRange(min, max) {
    const all = await this.getAllByProject();
    return all.filter((el) => {
      const p = el.production?.progress ?? 0;
      return p >= min && p <= max;
    });
  }

  async updateProductionData(globalId, productionData) {
    const ref = this._docRef(globalId);
    const payload = {};
    for (const [key, value] of Object.entries(productionData)) {
      payload[`production.${key}`] = value;
    }
    payload.updatedAt = Timestamp.fromDate(new Date());
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return toPlainObject(snap);
  }

  async getByBudgetRange(min, max) {
    const all = await this.getAllByProject();
    return all.filter((el) => {
      const b = el.economic?.budget ?? 0;
      return b >= min && b <= max;
    });
  }

  async updateEconomicData(globalId, economicData) {
    const ref = this._docRef(globalId);
    const payload = {};
    for (const [key, value] of Object.entries(economicData)) {
      payload[`economic.${key}`] = value;
    }
    payload.updatedAt = Timestamp.fromDate(new Date());
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return toPlainObject(snap);
  }

  async addIssue(globalId, issueData) {
    const issue = createIssue({ ...issueData, globalId });
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.issues || [];
      transaction.update(ref, {
        'management.issues': [...existing, issue],
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return issue;
  }

  async updateIssue(globalId, issueId, updates) {
    const ref = this._docRef(globalId);
    let updated;
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const issues = (snap.data()?.management?.issues || []).map((i) =>
        i.id === issueId ? { ...i, ...updates, updatedAt: now() } : i
      );
      updated = issues.find((i) => i.id === issueId);
      transaction.update(ref, {
        'management.issues': issues,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return updated;
  }

  async removeIssue(globalId, issueId) {
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const issues = (snap.data()?.management?.issues || []).filter((i) => i.id !== issueId);
      transaction.update(ref, {
        'management.issues': issues,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return true;
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
    const ref = this._docRef(globalId);
    const entry = { id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, ...observation, createdAt: now() };
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.observations || [];
      transaction.update(ref, {
        'management.observations': [...existing, entry],
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return entry;
  }

  async removeObservation(globalId, observationId) {
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.observations || [];
      transaction.update(ref, {
        'management.observations': existing.filter((o) => o.id !== observationId),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return true;
  }

  async addPhoto(globalId, photoData) {
    const photo = createPhoto({ ...photoData, globalId });
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.photos || [];
      transaction.update(ref, {
        'management.photos': [...existing, photo],
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return photo;
  }

  async removePhoto(globalId, photoId) {
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.photos || [];
      transaction.update(ref, {
        'management.photos': existing.filter((p) => p.id !== photoId),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return true;
  }

  async getPhotosByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return metadata?.management?.photos || [];
  }

  async addDocument(globalId, documentData) {
    const document = createDocument({ ...documentData, globalId });
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.documents || [];
      transaction.update(ref, {
        'management.documents': [...existing, document],
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return document;
  }

  async removeDocument(globalId, documentId) {
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.documents || [];
      transaction.update(ref, {
        'management.documents': existing.filter((d) => d.id !== documentId),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return true;
  }

  async getDocumentsByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return metadata?.management?.documents || [];
  }

  async addHistoryEntry(globalId, entryData) {
    const entry = createHistoryEntry({ ...entryData, globalId });
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.management?.history || [];
      transaction.update(ref, {
        'management.history': [...existing, entry],
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return entry;
  }

  async getHistoryByGlobalId(globalId) {
    const metadata = await this.getByGlobalId(globalId);
    return (metadata?.management?.history || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async updateAnalyticalData(globalId, analyticalData) {
    const ref = this._docRef(globalId);
    const payload = {};
    for (const [key, value] of Object.entries(analyticalData)) {
      payload[`analytical.${key}`] = value;
    }
    payload.updatedAt = Timestamp.fromDate(new Date());
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return toPlainObject(snap);
  }

  async addAnalyticalSnapshot(globalId, snapshotData) {
    const snapshot = createAnalyticalSnapshot({ ...snapshotData, globalId });
    const ref = this._docRef(globalId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      const existing = snap.data()?.analytical?.snapshots || [];
      transaction.update(ref, {
        'analytical.snapshots': [...existing, snapshot],
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    return snapshot;
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
    const batch = writeBatch(db);
    for (const item of items) {
      const { globalId, ...data } = item;
      const ref = this._docRef(globalId);
      const metadata = createEmptyMetadata(globalId, { ...data, projectId: this.projectId });
      batch.set(ref, { ...metadata, createdAt: Timestamp.fromDate(new Date(metadata.createdAt)), updatedAt: Timestamp.fromDate(new Date()) });
    }
    await batch.commit();
    return items.length;
  }

  async bulkUpdate(updates) {
    const batch = writeBatch(db);
    for (const { globalId, ...data } of updates) {
      const ref = this._docRef(globalId);
      batch.update(ref, { ...data, updatedAt: Timestamp.fromDate(new Date()) });
    }
    await batch.commit();
    return updates.length;
  }

  async bulkDelete(globalIds) {
    const batch = writeBatch(db);
    for (const globalId of globalIds) {
      batch.delete(this._docRef(globalId));
    }
    await batch.commit();
    return globalIds.length;
  }
}

export default FirestoreMetadataRepository;
