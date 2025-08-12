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
  // Solo guarda los datos del formulario (formData)
  const saveRDI = useCallback(async (formData, snapshotData = null) => {
    if (!db) {
      console.warn('IndexedDB no está listo');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const transaction = db.transaction(['topics'], 'readwrite');
      const store = transaction.objectStore('topics');
      
      // Preparar los datos del formulario para guardar
      const rdiToSave = {
        // Solo datos del formulario
        types: formData.types,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        comentario: formData.comentario,
        fecha: formData.fecha,
        statuses: formData.statuses,
        labels: formData.labels,
        // Metadatos de gestión
        id: formData.id || Date.now(),
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Datos del snapshot si existe
        ...(snapshotData && {
          snapshot: {
            imageData: snapshotData.imageData,
            viewpointData: snapshotData.viewpointData,
            createdAt: new Date().toISOString()
          }
        })
      };

      const request = store.add(rdiToSave);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('RDI (formData + snapshot) guardado en IndexedDB:', rdiToSave);
          
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
  const updateRDI = useCallback(async (id, updatedData, snapshotData = null) => {
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
            // Actualizar snapshot si se proporciona
            ...(snapshotData && {
              snapshot: {
                imageData: snapshotData.imageData,
                viewpointData: snapshotData.viewpointData,
                createdAt: new Date().toISOString()
              }
            })
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

  // Convertir datos de RDI a formato BCF Topic
  const convertRDIToBCFTopic = useCallback((rdiData) => {
    return {
      guid: `rdi-${rdiData.id}`, // GUID único para BCF
      title: rdiData.titulo || 'Sin título',
      description: rdiData.descripcion || '',
      topic_type: rdiData.types || 'Información',
      topic_status: rdiData.statuses || 'Pendiente',
      labels: rdiData.labels ? [rdiData.labels] : [],
      creation_date: rdiData.createdAt || new Date().toISOString(),
      modified_date: rdiData.updatedAt || new Date().toISOString(),
      due_date: rdiData.fecha ? new Date(rdiData.fecha.split('/').reverse().join('-')).toISOString() : null,
      assigned_to: 'coordinacion@gmail.com', // Usuario por defecto
      stage: 'Diseño',
      // Campos adicionales para contexto
      priority: 'Normal',
      index: rdiData.id,
      // Comentarios si existen
      ...(rdiData.comentario && {
        comments: [{
          guid: `comment-${rdiData.id}`,
          date: rdiData.createdAt || new Date().toISOString(),
          author: 'signed.user@mail.com',
          comment: rdiData.comentario,
          topic_guid: `rdi-${rdiData.id}`
        }]
      })
    };
  }, []);

  // Exportar un RDI individual a formato BCF
  const exportRDIToBCF = useCallback(async (rdiId) => {
    const rdi = getRDIById(rdiId);
    if (!rdi) {
      throw new Error(`RDI con ID ${rdiId} no encontrado`);
    }

    const bcfTopic = convertRDIToBCFTopic(rdi);
    
    // Crear estructura BCF básica
    const bcfData = {
      version: '3.0',
      topics: [bcfTopic],
      project: {
        name: 'Proyecto RDI',
        project_id: 'rdi-project'
      }
    };

    // Convertir a JSON para descarga
    const jsonString = JSON.stringify(bcfData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Crear enlace de descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RDI_${rdi.id}_${rdi.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.bcf.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('RDI exportado a BCF:', bcfTopic);
    return bcfTopic;
  }, [getRDIById, convertRDIToBCFTopic]);

  // Exportar todos los RDIs a formato BCF
  const exportAllRDIsToBCF = useCallback(async () => {
    if (rdiList.length === 0) {
      throw new Error('No hay RDIs para exportar');
    }

    const bcfTopics = rdiList.map(rdi => convertRDIToBCFTopic(rdi));
    
    // Crear estructura BCF completa
    const bcfData = {
      version: '3.0',
      topics: bcfTopics,
      project: {
        name: 'Proyecto RDI - Exportación Completa',
        project_id: 'rdi-project-full',
        creation_date: new Date().toISOString()
      },
      extensions: {
        topic_type: Array.from(new Set(rdiList.map(rdi => rdi.types).filter(Boolean))),
        topic_status: Array.from(new Set(rdiList.map(rdi => rdi.statuses).filter(Boolean))),
        topic_label: Array.from(new Set(rdiList.map(rdi => rdi.labels).filter(Boolean))),
        users: ['signed.user@mail.com', 'coordinacion@gmail.com']
      }
    };

    // Convertir a JSON para descarga
    const jsonString = JSON.stringify(bcfData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Crear enlace de descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Todos_los_RDIs_${new Date().toISOString().split('T')[0]}.bcf.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`${rdiList.length} RDIs exportados a BCF:`, bcfTopics);
    return bcfData;
  }, [rdiList, convertRDIToBCFTopic]);

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
    
    // Exportación BCF
    convertRDIToBCFTopic,
    exportRDIToBCF,
    exportAllRDIsToBCF,
  };
};