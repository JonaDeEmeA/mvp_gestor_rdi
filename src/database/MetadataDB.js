const DB_NAME = 'MetadataDB';
const DB_VERSION = 1;

export const STORES = {
  METADATA: 'metadata',
  SYNC_QUEUE: 'syncQueue',
};

const getStoreConfig = (storeName) => {
  const configs = {
    [STORES.METADATA]: {
      keyPath: 'globalId',
      indices: [
        { name: 'projectId', keyPath: 'projectId', options: { unique: false } },
        { name: 'ifcVersionId', keyPath: 'ifcVersionId', options: { unique: false } },
        { name: 'elementStatus', keyPath: 'elementStatus', options: { unique: false } },
        { name: 'syncStatus', keyPath: 'syncStatus', options: { unique: false } },
        { name: 'specialty', keyPath: 'classification.specialty', options: { unique: false } },
        { name: 'discipline', keyPath: 'classification.discipline', options: { unique: false } },
        { name: 'responsible', keyPath: 'contractual.responsible', options: { unique: false } },
        { name: 'company', keyPath: 'contractual.company', options: { unique: false } },
        { name: 'isCriticalPath', keyPath: 'contractual.isCriticalPath', options: { unique: false } },
        { name: 'progressGroupId', keyPath: 'production.progressGroupId', options: { unique: false } },
        { name: 'progress', keyPath: 'production.progress', options: { unique: false } },
      ],
    },
    [STORES.SYNC_QUEUE]: {
      keyPath: 'id',
      indices: [
        { name: 'status', keyPath: 'status', options: { unique: false } },
        { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } },
      ],
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
