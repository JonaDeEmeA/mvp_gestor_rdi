import { useState, useEffect, useRef } from 'react';
import * as OBC from "@thatopen/components";

export const useBCFTopics = (component, db) => {
  const [topics, setTopics] = useState([]);
  const [topicsFromDB, setTopicsFromDB] = useState([]);
  const [bcfTopicSet, setBcfTopicSet] = useState({});
  const bcfTopicsRef = useRef(null);

  // Inicializar BCF Topics
  useEffect(() => {
    if (!component) return;

    const bcfTopics = component.get(OBC.BCFTopics);

    bcfTopics.setup({
      author: "signed.user@mail.com",
      types: new Set([...bcfTopics.config.types, "Información", "Coordinación", "Interferencia"]),
      statuses: new Set(["Resuelto", "Pendiente", "En revision"]),
      labels: new Set(["Arquitectura", "Calculo", "Electricidad", "Sanitario", "Climatización"]),
      users: new Set(["jonamorales@gmail.com", "coordinacion@gmail.com"]),
      version: "3",
    });

    bcfTopicsRef.current = bcfTopics;

    setBcfTopicSet({
      statuses: bcfTopics.config.statuses,
      types: bcfTopics.config.types,
      labels: bcfTopics.config.labels,
      users: bcfTopics.config.users,
    });

    // Listener para nuevos topics
    bcfTopics.list.onItemSet.add(({ value: topic }) => {
      setTopics(prev => [...prev, topic]);
    });

  }, [component]);

  // Cargar topics desde IndexedDB
  useEffect(() => {
    if (!db) return;

    const transaction = db.transaction(['topics'], 'readonly');
    const store = transaction.objectStore('topics');
    const request = store.getAll();

    request.onsuccess = () => {
      setTopicsFromDB(request.result);
      console.log('Datos cargados desde IndexedDB:', request.result);
    };

    request.onerror = (event) => {
      console.error('Error cargando topics desde IndexedDB:', event.target.error);
    };
  }, [db]);

  // Crear nuevo topic BCF
  const createBCFTopic = async (topicData, viewpoint, editId = null) => {
    if (!bcfTopicsRef.current) {
      console.warn('BCF Topics no está inicializado');
      return null;
    }

    const bcfTopicData = {
      title: topicData.titulo,
      description: topicData.descripcion,
      dueDate: topicData.fecha,
      type: topicData.types,
      status: topicData.statuses,
      labels: [topicData.labels],
    };

    // Si es edición, agrega el id original
    if (editId !== null) {
      bcfTopicData.id = editId;
    }

    const topic = bcfTopicsRef.current.create(bcfTopicData);

    // Agregar viewpoint si existe
    if (viewpoint) {
      topic.viewpoints.add(viewpoint.guid);
    }

    // Guardar en IndexedDB
    await saveTopicToDB(topic, editId);

    return topic;
  };

  // Guardar topic en IndexedDB
  const saveTopicToDB = async (topic, editId = null) => {
    if (!db) {
      console.warn('IndexedDB no está listo, no se guardó el topic');
      return;
    }

    try {
      const transaction = db.transaction(['topics'], 'readwrite');
      const store = transaction.objectStore('topics');
      const topicToSave = topic.toJSON();

      // Asignar ID apropiado
      if (!topicToSave.id) {
        topicToSave.id = Date.now();
        console.log("Nuevo topic, asignando id:", topicToSave.id);
      }

      if (editId !== null) {
        topicToSave.id = editId;
        console.log("Editando topic, manteniendo id:", topicToSave.id);
      }

      store.put(topicToSave);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('Topic guardado en IndexedDB');
          // Actualizar lista local
          setTopicsFromDB(prev => {
            const index = prev.findIndex(t => t.id === topicToSave.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = topicToSave;
              return updated;
            }
            return [...prev, topicToSave];
          });
          resolve(topicToSave);
        };

        transaction.onerror = (event) => {
          console.error('Error guardando topic en IndexedDB:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en saveTopicToDB:', error);
      throw error;
    }
  };

  // Limpiar todos los topics de IndexedDB
  const clearAllTopics = () => {
    if (!db) {
      console.warn("IndexedDB no está listo");
      return;
    }

    const transaction = db.transaction(['topics'], 'readwrite');
    const store = transaction.objectStore('topics');
    const request = store.clear();

    request.onsuccess = () => {
      console.log('Todos los topics han sido eliminados de IndexedDB');
      setTopicsFromDB([]);
    };

    request.onerror = (event) => {
      console.error('Error al eliminar los topics:', event.target.error);
    };
  };

  return {
    topics,
    topicsFromDB,
    bcfTopicSet,
    bcfTopicsRef,
    createBCFTopic,
    saveTopicToDB,
    clearAllTopics,
  };
};