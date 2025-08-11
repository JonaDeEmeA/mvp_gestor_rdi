import { useState, useEffect, useCallback } from 'react';

export const useRDIManager = (db) => {
  const [rdiList, setRdiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar RDIs desde IndexedDB al inicializar
  useEffect(() => {
    if (db) {
      loadRDIsFromDB();
    }
  }, [db]);

  // Cargar todos los RDIs desde IndexedDB
  const loadRDIsFromDB = useCallback(async () => {
    if (!db) return;

    setLoading(true);
    setError(null);

    try {
      const transaction = db.transaction(['topics'], 'readonly');
      const store = transaction.objectStore('topics');
      const request = store.getAll();

      request.onsuccess = () => {
        const rdisFromDB = request.result || [];
        console.log('RDIs cargados desde IndexedDB:', rdisFromDB);
        setRdiList(rdisFromDB);
        setLoading(false);
      };

      request.onerror = (event) => {
        console.error('Error cargando RDIs desde IndexedDB:', event.target.error);
        setError(event.target.error);
        setLoading(false);
      };
    } catch (err) {
      console.error('Error en loadRDIsFromDB:', err);
      setError(err);
      setLoading(false);
    }
  }, [db]);

  // Guardar nuevo RDI en IndexedDB y actualizar lista local
  const saveRDI = useCallback(async (rdiData) => {
    if (!db) {
      console.warn('IndexedDB no está listo');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const transaction = db.transaction(['topics'], 'readwrite');
      const store = transaction.objectStore('topics');
      
      // Preparar datos para guardar
      const rdiToSave = {
        ...rdiData,
        id: rdiData.id || Date.now(),
        createdAt: rdiData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const request = store.add(rdiToSave);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('RDI guardado en IndexedDB:', rdiToSave);
          
          // Actualizar lista local
          setRdiList(prev => [...prev, rdiToSave]);
          setLoading(false);
          resolve(rdiToSave);
        };

        request.onerror = (event) => {
          console.error('Error guardando RDI:', event.target.error);
          setError(event.target.error);
          setLoading(false);
          reject(event.target.error);
        };
      });
    } catch (err) {
      console.error('Error en saveRDI:', err);
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db]);

  // Actualizar RDI existente en IndexedDB y lista local
  const updateRDI = useCallback(async (id, updatedData) => {
    if (!db) {
      console.warn('IndexedDB no está listo');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const transaction = db.transaction(['topics'], 'readwrite');
      const store = transaction.objectStore('topics');
      
      // Primero obtener el RDI existente
      const getRequest = store.get(id);

      return new Promise((resolve, reject) => {
        getRequest.onsuccess = () => {
          const existingRDI = getRequest.result;
          
          if (!existingRDI) {
            const error = new Error(`RDI con ID ${id} no encontrado`);
            setError(error);
            setLoading(false);
            reject(error);
            return;
          }

          // Preparar datos actualizados
          const updatedRDI = {
            ...existingRDI,
            ...updatedData,
            id: id, // Mantener el ID original
            updatedAt: new Date().toISOString(),
          };

          // Actualizar en IndexedDB
          const putRequest = store.put(updatedRDI);

          putRequest.onsuccess = () => {
            console.log('RDI actualizado en IndexedDB:', updatedRDI);
            
            // Actualizar lista local
            setRdiList(prev => 
              prev.map(rdi => rdi.id === id ? updatedRDI : rdi)
            );
            setLoading(false);
            resolve(updatedRDI);
          };

          putRequest.onerror = (event) => {
            console.error('Error actualizando RDI:', event.target.error);
            setError(event.target.error);
            setLoading(false);
            reject(event.target.error);
          };
        };

        getRequest.onerror = (event) => {
          console.error('Error obteniendo RDI para actualizar:', event.target.error);
          setError(event.target.error);
          setLoading(false);
          reject(event.target.error);
        };
      });
    } catch (err) {
      console.error('Error en updateRDI:', err);
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db]);

  // Eliminar RDI de IndexedDB y lista local
  const deleteRDI = useCallback(async (id) => {
    if (!db) {
      console.warn('IndexedDB no está listo');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const transaction = db.transaction(['topics'], 'readwrite');
      const store = transaction.objectStore('topics');
      const request = store.delete(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('RDI eliminado de IndexedDB:', id);
          
          // Actualizar lista local
          setRdiList(prev => prev.filter(rdi => rdi.id !== id));
          setLoading(false);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error eliminando RDI:', event.target.error);
          setError(event.target.error);
          setLoading(false);
          reject(event.target.error);
        };
      });
    } catch (err) {
      console.error('Error en deleteRDI:', err);
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db]);

  // Actualizar solo el estado de un RDI
  const updateRDIStatus = useCallback(async (id, newStatus) => {
    return updateRDI(id, { statuses: newStatus });
  }, [updateRDI]);

  // Obtener RDI por ID
  const getRDIById = useCallback((id) => {
    return rdiList.find(rdi => rdi.id === id);
  }, [rdiList]);

  // Limpiar todos los RDIs
  const clearAllRDIs = useCallback(async () => {
    if (!db) {
      console.warn('IndexedDB no está listo');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const transaction = db.transaction(['topics'], 'readwrite');
      const store = transaction.objectStore('topics');
      const request = store.clear();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('Todos los RDIs eliminados de IndexedDB');
          setRdiList([]);
          setLoading(false);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error limpiando RDIs:', event.target.error);
          setError(event.target.error);
          setLoading(false);
          reject(event.target.error);
        };
      });
    } catch (err) {
      console.error('Error en clearAllRDIs:', err);
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [db]);

  // Recargar datos desde DB
  const refreshRDIs = useCallback(() => {
    loadRDIsFromDB();
  }, [loadRDIsFromDB]);

  // Obtener estadísticas
  const getRDIStats = useCallback(() => {
    const total = rdiList.length;
    const byStatus = rdiList.reduce((acc, rdi) => {
      const status = rdi.statuses || 'Sin estado';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const byType = rdiList.reduce((acc, rdi) => {
      const type = rdi.types || 'Sin tipo';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return { total, byStatus, byType };
  }, [rdiList]);

  return {
    // Estado
    rdiList,
    loading,
    error,
    
    // Operaciones CRUD
    saveRDI,
    updateRDI,
    deleteRDI,
    updateRDIStatus,
    
    // Utilidades
    getRDIById,
    clearAllRDIs,
    refreshRDIs,
    getRDIStats,
    
    // Operaciones de carga
    loadRDIsFromDB,
  };
};