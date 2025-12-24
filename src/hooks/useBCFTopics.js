import { useState, useEffect, useRef } from 'react';
import * as OBC from "@thatopen/components";
import { log } from 'three';

export const useBCFTopics = (component, db) => {
  const [loadedTopicIds, setLoadedTopicIds] = useState([]);
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
    //bcfTopics.list.onItemSet.add(({ value: topic }) => {
    //  setTopics(prev => [...prev, topic]);
    //});

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

 
   // Función auxiliar de transformación ( estos son los datos de la cámara)  
  const transformCoordinates = (cameraData) => { 
   if (!cameraData) return cameraData;  
    
  const transformVector = (vector) => {  
    // Transformación: Y-up -> Z-up para objetos {x, y, z}  
    // {x, y, z} -> {x: x, y: z, z: -y}  
    return {  
      x: vector.x,  
      y: vector.z,  
      z: -vector.y  
    };  
  };  
    
  return {  
    ...cameraData,  
    camera_view_point: transformVector(cameraData.camera_view_point),  
    camera_direction: transformVector(cameraData.camera_direction),  
    camera_up_vector: transformVector(cameraData.camera_up_vector),  
  };  
     
  };  

  const createViewpointFromSnapshot = async (snapshotData) => {
    const viewpoints = component.get(OBC.Viewpoints);

    // Transformar coordenadas de Three.js a BCF estándar  
  const transformedViewpointData = {  
     ...snapshotData.viewpointData,  
    camera: transformCoordinates(snapshotData.viewpointData.camera)
  }; 

  console.log("datos transformados" , transformedViewpointData);
  
    // 1. Crear el viewpoint vacío primero  
    const viewpoint = viewpoints.create(transformedViewpointData);

    // 2. Asignar el world ANTES de actualizar la cámara  
    viewpoint.world = viewpoints.world;

    // 3. Si tienes datos de viewpoint guardados, úsalos con set()  
    if (snapshotData.viewpointData) {
      viewpoint.set(snapshotData.viewpointData);
      viewpoint.camera = snapshotData.viewpointData.camera;
      console.log("Camera después de set():", viewpoint.camera);
      console.log("¿Tiene field_of_view?", "field_of_view" in viewpoint.camera);

      // Si tienes GUID original, asígnalo  
      if (snapshotData.viewpointData.guid) {
        viewpoint.guid = snapshotData.viewpointData.guid;
      }
    }


    // Asignar el world  
    //viewpoint.world = viewpoints.world;

    // 4. Agregar a la lista manualmente  
    viewpoints.list.set(viewpoint.guid, viewpoint);

    // 5. Asignar el snapshot   
    if (snapshotData.imageData) {
      // Remover prefijo si existe  
      const base64Data = snapshotData.imageData.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Validar que sea PNG (firma mágica: 89 50 4E 47)
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        console.log('✅ Snapshot válido (PNG)');
        viewpoints.snapshots.set(viewpoint.snapshot, bytes);
      } else {
        console.warn('⚠️ Imagen no es PNG válido');
      }

      //viewpoints.snapshots.set(viewpoint.snapshot, bytes);
    }
    // Actualizar datos de cámara (sin tomar nuevo snapshot)


    //await viewpoint.updateCamera(false);
    console.log("Camera data:", snapshotData.viewpointData);
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
    const viewpoint = await createViewpointFromSnapshot(vpData);
    console.log('Viewpoint asociado al topic:', viewpoint);
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

    // Verificar viewpoints  
    if (topic.viewpoints.size === 0) {
      console.error("El topic no tiene viewpoints asociados");
      return;
    }

    // Obtener el sistema de viewpoints  
    const viewpoints = component.get(OBC.Viewpoints);

    // Verificar cada viewpoint y su snapshot  
    for (const vpGuid of topic.viewpoints) {
      const viewpoint = viewpoints.list.get(vpGuid);
      if (!viewpoint) {
        console.error(`Viewpoint ${vpGuid} no encontrado`);
        continue;
      }

      // Verificar que el snapshot existe  
      const snapshotData = viewpoints.snapshots.get(viewpoint.snapshot);
      if (!snapshotData) {
        console.error(`Snapshot no encontrado para viewpoint ${vpGuid}`);
      } else {
        console.log(`✓ Snapshot encontrado: ${snapshotData.length} bytes`);
      }
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
    //link.download = `RDI_${safeTitle}.bcfzip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`Topic "${topic.title}" exportado a BCF.`);
  }

  // Nueva función para exportar con XML correcto  
  const exportBCFWithCorrectXML = async (topic) => {
    if (!bcfTopicsRef.current) {
      console.error("BCF Topics no está inicializado.");
      return;
    }

    if (!topic) {
      throw new Error('Topic no proporcionado');
    }

    // 1. Obtener el viewpoint del topic  
    const viewpointGuid = Array.from(topic.viewpoints)[0];
    const viewpoints = component.get(OBC.Viewpoints);
    const viewpoint = viewpoints.list.get(viewpointGuid);

    if (!viewpoint) {
      throw new Error('Viewpoint no encontrado para el topic');
    }




    // 2. Generar XML con estructura correcta  
    const markupXml = `<?xml version="1.0" encoding="UTF-8"?>  
<Markup xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  
  <Header/>  
  <Topic Guid="${topic.guid}" TopicType="${topic.type}" TopicStatus="${topic.status}">  
    <Title>${topic.title}</Title>  
    <CreationAuthor>${topic.creationAuthor}</CreationAuthor>  
    <CreationDate>${topic.creationDate.toISOString()}</CreationDate>  
    ${topic.dueDate ? `<DueDate>${topic.dueDate.toISOString()}</DueDate>` : ''}  
    <Description>${topic.description || ''}</Description>  
    <DocumentReferences/>  
    <RelatedTopics/>  
    <Labels>${Array.from(topic.labels).map(l => `<Label>${l}</Label>`).join('')}</Labels>  
  </Topic>  
  <Viewpoints Guid="${viewpointGuid}">  
    <Viewpoint>viewpoint.bcfv</Viewpoint>  
    <Snapshot>snapshot.png</Snapshot>  
  </Viewpoints>  
  <Comments/>  
</Markup>`;

    // 3. Generar viewpoint.bcfv  
    const camera = viewpoint.camera;
    const viewpointXml = `<?xml version="1.0" encoding="UTF-8"?>  
<VisualizationInfo Guid="${viewpointGuid}"> 
  <Components>  
     
  </Components> 
  <PerspectiveCamera>  
    <CameraViewPoint>  
      <X>${camera.camera_view_point.x}</X>  
      <Y>${camera.camera_view_point.y}</Y>  
      <Z>${camera.camera_view_point.z}</Z>  
    </CameraViewPoint>  
    <CameraDirection>  
      <X>${camera.camera_direction.x}</X>  
      <Y>${camera.camera_direction.y}</Y>  
      <Z>${camera.camera_direction.z}</Z>  
    </CameraDirection>  
    <CameraUpVector>  
      <X>${camera.camera_up_vector.x}</X>  
      <Y>${camera.camera_up_vector.y}</Y>  
      <Z>${camera.camera_up_vector.z}</Z>  
    </CameraUpVector>  
    <AspectRatio>${camera.aspect_ratio}</AspectRatio>  
    ${camera.field_of_view ? `<FieldOfView>${camera.field_of_view}</FieldOfView>` : ''}  
  </PerspectiveCamera>  
  
</VisualizationInfo>`;
    console.log("VIEWPONT-----------", camera.camera_up_vector.x);
    console.log("VIEWPONTs+++++++++++", viewpoints);

    // 4. Crear estructura ZIP  
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const topicFolder = zip.folder(topic.guid);
    topicFolder.file('markup.bcf', markupXml);
    topicFolder.file('viewpoint.bcfv', viewpointXml);

    // 5. Agregar snapshot  
    const snapshotData = viewpoints.snapshots.get(viewpoint.snapshot);
    if (snapshotData) {
      topicFolder.file('snapshot.png', snapshotData);
    }

    // 6. Agregar bcf.version  
    const versionXml = `<?xml version="1.0" encoding="UTF-8"?>  
<Version VersionId="3.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">  
  <DetailedVersion>3.0</DetailedVersion>  
</Version>`;
    zip.file('bcf.version', versionXml);

    // 7. Generar y descargar  
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = topic.title.replace(/[^a-zA-Z0-9]/g, '_');
    //link.download = `RDI_${safeTitle}.bcfzip`;
    link.download = `RDI_${safeTitle}.bcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    //console.log(`Topic "${viewpoint.camera}" exportado con XML correcto.`);
    //return topic;
  };

  // Importar topics desde un archivo BCF local
  const importBCF = () => {
    /*if (!bcfTopicsRef.current) {
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

        console.log("Archivo BCF cargado exitosamente:", topics);
      } catch (error) {
        console.error("Error al cargar el archivo BCF:", error);
      } finally {
        // Limpiar para permitir la selección del mismo archivo de nuevo
        document.body.removeChild(input);
      }
    };
    document.body.appendChild(input);
    input.click();*/
    const input = document.createElement("input");
    input.multiple = false;
    input.accept = ".bcf";
    input.type = "file";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const buffer = await file.arrayBuffer();
      const { topics, viewpoints } = await bcfTopicsRef.current.load(new Uint8Array(buffer));
      console.log(topics, viewpoints);
    });

    setLoadedTopicIds(topics.map(t => t.guid)); 
    // Acceder a los datos completos cuando sea necesario  
    //const topic = bcfTopics.list.get(topicId); 

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
    exportBCFWithCorrectXML,
    exportBCF,
    importBCF,
    clearAllTopics,
  };
};