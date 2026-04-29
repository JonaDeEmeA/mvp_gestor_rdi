import { useState, useEffect } from 'react';

const initializeIndexedDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BCFDatabase', 2);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('Migrando/Inicializando IndexedDB a versión', event.newVersion);
      if (!db.objectStoreNames.contains('topics')) {
        db.createObjectStore('topics', { keyPath: 'id' });
        console.log('Store "topics" creado exitosamente');
      }
    };

    request.onsuccess = (event) => {
      console.log('BCFDatabase abierta con éxito');
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      console.error('Error abriendo BCFDatabase:', event.target.error);
      reject(event.target.error);
    };
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