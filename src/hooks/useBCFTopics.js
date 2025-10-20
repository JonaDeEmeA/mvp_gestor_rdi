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

  const createViewpointFromSnapshot = async (snapshotData) => {
    const viewpoints = component.get(OBC.Viewpoints);


    // Crear el viewpoint usando los datos del snapshot  
    const viewpoint = viewpoints.create(snapshotData.viewpointData);
    // IMPORTANTE: Agregar a la lista manualmente  
    viewpoints.list.set(viewpoint.guid, viewpoint);

    // Asignar el world  
    viewpoint.world = viewpoints.world;

    // Asignar el snapshot  
    if (snapshotData.imageData) {
      // Remover prefijo si existe  
      const base64Data = snapshotData.imageData.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      viewpoints.snapshots.set(viewpoint.snapshot, bytes);
    }
    // Actualizar datos de cámara (sin tomar nuevo snapshot)  
    await viewpoint.updateCamera(false);

    return viewpoint;
  };

  // Crear nuevo topic BCF
  const createBCFTopic = async (topicData, vpData, editId = null) => {
    if (!bcfTopicsRef.current) {
      console.warn('BCF Topics no está inicializado');
      return null;
    }

    // Convertir fecha de string 'dd/mm/yyyy' a objeto Date si es necesario
    let dueDate = null;
    if (topicData.fecha) {
      if (typeof topicData.fecha === 'string') {
        const [day, month, year] = topicData.fecha.split('/');
        dueDate = new Date(`${year}-${month}-${day}`);
      } else if (topicData.fecha instanceof Date) {
        dueDate = topicData.fecha;
      }
    }
    const bcfTopicData = {
      title: topicData.titulo,
      description: topicData.descripcion,
      dueDate: dueDate,
      type: topicData.tipo,
      status: topicData.estado,
      labels: new Set([topicData.estiqueta]),
    };

    // Si es edición, agrega el id original
    if (editId !== null) {
      bcfTopicData.id = editId;
    }

    const topic = bcfTopicsRef.current.create(bcfTopicData);

    // 2. Crear el viewpoint desde tu snapshot  
    const viewpoint = createViewpointFromSnapshot(vpData);
    // 3. Asociar el viewpoint al topic  
    topic.viewpoints.add(viewpoint.guid);

    return topic;
  };

  // Exportar un topic a un archivo BCF
  const exportBCF = async (topic) => {
    if (!bcfTopicsRef.current) {
      console.error("BCF Topics no está inicializado.");
      return;
    }
    // Verificar y añadir manualmente si es necesario  
    if (!bcfTopicsRef.current.list.has(topic.guid)) {
      bcfTopicsRef.current.list.set(topic.guid, topic);
    }
    console.log("Topic instance:", topic);
    console.log("Topic constructor:", topic.constructor);
    console.log("Topic prototype chain:", Object.getPrototypeOf(topic));
    console.log("Has serialize method:", 'serialize' in topic);
    console.log("Serialize method:", topic.serialize);

    // Verificar si es realmente una instancia de Topic  
    console.log("Is Topic instance:", topic instanceof OBC.Topic);


    const blob = await bcfTopicsRef.current.export([topic]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = topic.title.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `RDI_${safeTitle}.bcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`Topic "${topic.title}" exportado a BCF.`);
  }

  // Importar topics desde un archivo BCF local
  const importBCF = () => {
    if (!bcfTopicsRef.current) {
      console.error("BCF Topics no está inicializado.");
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bcf,.bcfzip'; // Acepta ambos formatos BCF
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const buffer = await file.arrayBuffer();
        // Usar el método .load() para procesar el buffer del archivo
        const { topics: loadedTopics, viewpoints } = await bcfTopicsRef.current.load(new Uint8Array(buffer));

        // Añadir los topics cargados al estado actual, evitando duplicados  
        setTopics(prevTopics => {
          const existingGuids = new Set(prevTopics.map(t => t.guid));
          const newTopics = loadedTopics.filter(t => !existingGuids.has(t.guid));
          return [...prevTopics, ...newTopics];
        });

        console.log("Archivo BCF cargado exitosamente:", loadedTopics);
      } catch (error) {
        console.error("Error al cargar el archivo BCF:", error);
      } finally {
        // Limpiar para permitir la selección del mismo archivo de nuevo
        document.body.removeChild(input);
      }
    };
    document.body.appendChild(input);
    input.click();
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
    exportBCF,
    importBCF,
    clearAllTopics,
  };
};