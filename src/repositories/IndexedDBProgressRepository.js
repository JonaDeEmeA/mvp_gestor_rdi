import { getDB, STORES } from '../database/ProgressDB';
import { DEFAULT_WEIGHT, round2 } from '../constants/progressStandards';

const generateId = () => `progress-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const executeTransaction = async (storeName, mode, callback) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);

    callback(store, resolve, reject);

    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(new Error('Transaction aborted'));
  });
};

class IndexedDBProgressRepository {
  async getGroups() {
    return executeTransaction(STORES.PROGRESS_GROUPS, 'readonly', (store, resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async getGroupById(id) {
    return executeTransaction(STORES.PROGRESS_GROUPS, 'readonly', (store, resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async createGroup(data) {
    const now = new Date().toISOString();
    const group = {
      id: generateId(),
      name: data.name || '',
      description: data.description || '',
      progress: round2(data.progress ?? 0),
      weight: data.weight ?? DEFAULT_WEIGHT,
      weightUnit: data.weightUnit || 'porcentaje',
      plannedProgress: round2(data.plannedProgress ?? 0),
      isCritical: data.isCritical ?? false,
      parentId: data.parentId || null,
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy || '',
    };

    return executeTransaction(STORES.PROGRESS_GROUPS, 'readwrite', (store, resolve, reject) => {
      const request = store.add(group);
      request.onsuccess = () => resolve(group);
      request.onerror = () => reject(request.error);
    });
  }

  async updateGroup(id, data) {
    const db = await getDB();
    const transaction = db.transaction([STORES.PROGRESS_GROUPS], 'readwrite');
    const store = transaction.objectStore(STORES.PROGRESS_GROUPS);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error(`Grupo con id ${id} no encontrado`));
          return;
        }

        const updated = {
          ...existing,
          ...data,
          id,
          progress: data.progress !== undefined ? round2(data.progress) : existing.progress,
          weight: data.weight !== undefined ? data.weight : existing.weight,
          plannedProgress: data.plannedProgress !== undefined ? round2(data.plannedProgress) : existing.plannedProgress,
          updatedAt: new Date().toISOString(),
        };

        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteGroup(id) {
    const db = await getDB();
    const transaction = db.transaction(
      [STORES.PROGRESS_GROUPS, STORES.GROUP_ELEMENTS],
      'readwrite'
    );
    const groupStore = transaction.objectStore(STORES.PROGRESS_GROUPS);
    const elementStore = transaction.objectStore(STORES.GROUP_ELEMENTS);

    groupStore.delete(id);

    const index = elementStore.index('groupId');
    const cursorRequest = index.openCursor(IDBKeyRange.only(id));

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getElementsByGroup(groupId) {
    return executeTransaction(STORES.GROUP_ELEMENTS, 'readonly', (store, resolve) => {
      const index = store.index('groupId');
      const request = index.getAll(IDBKeyRange.only(groupId));
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async addElementToGroup(groupId, ifcGuid, elementType = '') {
    const existing = await this.getElementsByGroup(groupId);
    if (existing.some((el) => el.ifcGuid === ifcGuid)) {
      throw new Error(`El elemento ${ifcGuid} ya está asignado a este grupo.`);
    }

    const element = {
      id: generateId(),
      groupId,
      ifcGuid,
      elementType,
    };

    return executeTransaction(STORES.GROUP_ELEMENTS, 'readwrite', (store, resolve, reject) => {
      const request = store.add(element);
      request.onsuccess = () => resolve(element);
      request.onerror = () => reject(request.error);
    });
  }

  async removeElementFromGroup(groupId, ifcGuid) {
    const db = await getDB();
    const transaction = db.transaction([STORES.GROUP_ELEMENTS], 'readwrite');
    const store = transaction.objectStore(STORES.GROUP_ELEMENTS);
    const index = store.index('groupId');

    return new Promise((resolve, reject) => {
      const cursorRequest = index.openCursor(IDBKeyRange.only(groupId));

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.ifcGuid === ifcGuid) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getGroupsByElement(ifcGuid) {
    const db = await getDB();
    const transaction = db.transaction(
      [STORES.GROUP_ELEMENTS, STORES.PROGRESS_GROUPS],
      'readonly'
    );
    const elementStore = transaction.objectStore(STORES.GROUP_ELEMENTS);
    const groupStore = transaction.objectStore(STORES.PROGRESS_GROUPS);
    const index = elementStore.index('ifcGuid');

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(ifcGuid));

      request.onsuccess = async () => {
        const elements = request.result || [];
        const groupIds = [...new Set(elements.map((el) => el.groupId))];

        const groups = [];
        for (const groupId of groupIds) {
          const groupRequest = groupStore.get(groupId);
          await new Promise((res) => {
            groupRequest.onsuccess = () => {
              if (groupRequest.result) groups.push(groupRequest.result);
              res();
            };
            groupRequest.onerror = () => res();
          });
        }
        resolve(groups);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getSnapshotsByGroup(groupId) {
    return executeTransaction(STORES.PROGRESS_SNAPSHOTS, 'readonly', (store, resolve) => {
      const index = store.index('groupId');
      const request = index.getAll(IDBKeyRange.only(groupId));
      request.onsuccess = () => {
        const snapshots = request.result || [];
        snapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(snapshots);
      };
    });
  }

  async getLatestSnapshotByGroup(groupId) {
    const snapshots = await this.getSnapshotsByGroup(groupId);
    return snapshots.length > 0 ? snapshots[0] : null;
  }

  async createSnapshot(data) {
    const snapshot = {
      id: generateId(),
      groupId: data.groupId,
      progress: data.progress,
      comment: data.comment || '',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || '',
    };

    return executeTransaction(STORES.PROGRESS_SNAPSHOTS, 'readwrite', (store, resolve, reject) => {
      const request = store.add(snapshot);
      request.onsuccess = () => resolve(snapshot);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotosBySnapshot(snapshotId) {
    return executeTransaction(STORES.SNAPSHOT_PHOTOS, 'readonly', (store, resolve) => {
      const index = store.index('snapshotId');
      const request = index.getAll(IDBKeyRange.only(snapshotId));
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async addPhoto(data) {
    const photo = {
      id: generateId(),
      snapshotId: data.snapshotId,
      imageData: data.imageData,
      caption: data.caption || '',
      createdAt: new Date().toISOString(),
    };

    return executeTransaction(STORES.SNAPSHOT_PHOTOS, 'readwrite', (store, resolve, reject) => {
      const request = store.add(photo);
      request.onsuccess = () => resolve(photo);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(photoId) {
    return executeTransaction(STORES.SNAPSHOT_PHOTOS, 'readwrite', (store, resolve, reject) => {
      const request = store.delete(photoId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getChildGroups(parentId) {
    return executeTransaction(STORES.PROGRESS_GROUPS, 'readonly', (store, resolve) => {
      const index = store.index('parentId');
      const request = index.getAll(IDBKeyRange.only(parentId));
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async getRootGroups() {
    return executeTransaction(STORES.PROGRESS_GROUPS, 'readonly', (store, resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result || [];
        resolve(all.filter((g) => !g.parentId));
      };
    });
  }

  async getGroupsByParent(parentId) {
    if (!parentId) return this.getRootGroups();
    return this.getChildGroups(parentId);
  }

  async getGroupTree() {
    const all = await this.getGroups();
    const map = new Map();
    const roots = [];

    for (const group of all) {
      map.set(group.id, { ...group, children: [] });
    }

    for (const group of all) {
      const node = map.get(group.id);
      if (group.parentId && map.has(group.parentId)) {
        map.get(group.parentId).children.push(node);
      } else if (!group.parentId) {
        roots.push(node);
      }
    }

    return roots;
  }
}

export default IndexedDBProgressRepository;
