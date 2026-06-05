const DB_NAME = 'ProgressDB';
const DB_VERSION = 1;

export const STORES = {
  PROGRESS_GROUPS: 'ProgressGroups',
  GROUP_ELEMENTS: 'GroupElements',
  PROGRESS_SNAPSHOTS: 'ProgressSnapshots',
  SNAPSHOT_PHOTOS: 'SnapshotPhotos',
};

const getStoreConfig = (storeName) => {
  const configs = {
    [STORES.PROGRESS_GROUPS]: {
      keyPath: 'id',
      indices: [{ name: 'name', keyPath: 'name', options: { unique: false } }],
    },
    [STORES.GROUP_ELEMENTS]: {
      keyPath: 'id',
      indices: [
        { name: 'groupId', keyPath: 'groupId', options: { unique: false } },
        { name: 'ifcGuid', keyPath: 'ifcGuid', options: { unique: false } },
      ],
    },
    [STORES.PROGRESS_SNAPSHOTS]: {
      keyPath: 'id',
      indices: [
        { name: 'groupId', keyPath: 'groupId', options: { unique: false } },
        { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
      ],
    },
    [STORES.SNAPSHOT_PHOTOS]: {
      keyPath: 'id',
      indices: [{ name: 'snapshotId', keyPath: 'snapshotId', options: { unique: false } }],
    },
  };
  return configs[storeName];
};

let dbInstance = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      for (const storeName of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          const config = getStoreConfig(storeName);
          const store = db.createObjectStore(storeName, { keyPath: config.keyPath });

          for (const index of config.indices) {
            store.createIndex(index.name, index.keyPath, index.options);
          }
        }
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const closeDB = () => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
};
