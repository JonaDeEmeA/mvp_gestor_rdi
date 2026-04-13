/**
 * Utilidad para mapear entre el formato estándar BCF y el formato interno de RDI.
 */

/**
 * Convierte un Uint8Array (binario) a una cadena Base64 (Data URL)
 * @param {Uint8Array} bytes 
 * @param {string} mimeType 
 * @returns {string}
 */
const bytesToBase64 = (bytes) => {
  if (!bytes || bytes.length === 0) return null;
  try {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Error al convertir bytes a Base64:", error);
    return null;
  }
};

/**
 * Mapea un Topic de BCF al formato RDI de la aplicación
 * @param {Object} topic Topic proveniente de @thatopen/components
 * @param {Object} viewpointsSistema Instancia del componente Viewpoints de ThatOpen
 * @returns {Object} Objeto RDI listo para ser guardado en IndexedDB
 */
export const mapBCFTopicToRDI = (topic, viewpointsSistema, viewpointsArchivo = null) => {
  // 1. Obtener el primer viewpoint asociado si existe
  let snapshotData = null;
  let viewpoint = null;
  
    let viewpointGuid = topic.viewpoints && topic.viewpoints.size > 0 
      ? Array.from(topic.viewpoints)[0] 
      : null;
    
    if (viewpointGuid) {
      // 1. Buscar el viewpoint en el sistema global
      viewpoint = viewpointsSistema?.list?.get(viewpointGuid);
      
      // 2. Si no está en el global, buscar en el mapa del archivo
      if (!viewpoint && viewpointsArchivo) {
        viewpoint = viewpointsArchivo.get ? viewpointsArchivo.get(viewpointGuid) : viewpointsArchivo[viewpointGuid];
      }
    }

    // --- BÚSQUEDA DE BYTES DEL SNAPSHOT ---
    let bytes = null;
    let snapshotIdUsed = null;

    // A. Si tenemos un viewpoint, buscar por su ID de snapshot
    if (viewpoint && viewpoint.snapshot) {
      snapshotIdUsed = viewpoint.snapshot;
      bytes = viewpointsSistema?.snapshots?.get(snapshotIdUsed);
      if (!bytes && viewpointsArchivo?.snapshots) {
        bytes = viewpointsArchivo.snapshots.get(snapshotIdUsed);
      }
    }

    // B. RESPALDO: Buscar directamente por el GUID del topic (frecuente en BCF 3.0)
    if (!bytes && topic.guid) {
      snapshotIdUsed = topic.guid;
      bytes = viewpointsSistema?.snapshots?.get(snapshotIdUsed);
      if (!bytes && viewpointsArchivo?.snapshots) {
        bytes = viewpointsArchivo.snapshots.get(snapshotIdUsed);
      }
    }

    // C. RESPALDO FINAL: Intentar con la clave genérica "snapshot" (común en BCF 2.1)
    if (!bytes && viewpointsSistema?.snapshots) {
      if (viewpointsSistema.snapshots.has("snapshot")) {
        bytes = viewpointsSistema.snapshots.get("snapshot");
        snapshotIdUsed = "snapshot";
      } 
    }
    
    if (bytes) {
      snapshotData = {
        imageData: bytesToBase64(bytes),
        viewpointData: {
          guid: viewpoint ? viewpoint.guid : topic.guid,
          title: viewpoint ? viewpoint.title : (topic.title || "Viewpoint BCF"),
          snapshot: snapshotIdUsed,
          camera: viewpoint?.camera ? {
            camera_view_point: viewpoint.camera.camera_view_point,
            camera_direction: viewpoint.camera.camera_direction,
            camera_up_vector: viewpoint.camera.camera_up_vector,
            aspect_ratio: viewpoint.camera.aspect_ratio,
            field_of_view: viewpoint.camera.field_of_view,
            view_to_world_scale: viewpoint.camera.view_to_world_scale
          } : null,
          selection: viewpoint?.selection || []
        },
        createdAt: new Date().toISOString()
      };
    }

  // 2. Mapear campos con fallback para casos vacíos
  // El ID se preserva del GUID de BCF para permitir desduplicación
  return {
    id: topic.guid || `rdi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    titulo: topic.title || 'Sin título',
    descripcion: topic.description || '',
    tipo: topic.type || 'Información',
    estado: topic.status || 'Pendiente',
    etiqueta: topic.labels && topic.labels.size > 0 ? Array.from(topic.labels)[0] : 'Arquitectura',
    assignedTo: topic.assignedTo || 'coordinacion@gmail.com',
    dueDate: topic.dueDate ? new Date(topic.dueDate).toLocaleDateString("es-ES") : '',
    fecha: topic.dueDate ? new Date(topic.dueDate).toLocaleDateString("es-ES") : '',
    creationAuthor: topic.creationAuthor || 'bcf.import@mail.com',
    creationDate: topic.creationDate ? topic.creationDate.toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    snapshot: snapshotData,
    comments: topic.comments && topic.comments.size > 0 
      ? Array.from(topic.comments.values()).map(c => ({
          guid: c.guid,
          author: c.author,
          date: c.date ? (typeof c.date.toISOString === 'function' ? c.date.toISOString() : new Date(c.date).toISOString()) : new Date().toISOString(),
          comment: c.comment
        })) 
      : []
  };
};
