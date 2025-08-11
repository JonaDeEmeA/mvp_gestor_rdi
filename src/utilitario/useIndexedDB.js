import { useState, useEffect } from 'react';

const initializeIndexedDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BCFDatabase', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('topics')) {
        db.createObjectStore('topics', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(request.error);
  });
};

export const useIndexedDB = () => {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await initializeIndexedDB();
        setDb(database);
      } catch (err) {
        console.error('Error al inicializar IndexedDB:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initDB();
  }, []);

  return { db, loading, error };
};