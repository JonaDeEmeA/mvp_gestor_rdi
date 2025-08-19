import { useState, useEffect, useRef } from 'react';
import * as OBC from "@thatopen/components";

export const useViewpoints = (component, world) => {
  const [viewpoint, setViewpoint] = useState(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [snapShotReady, setSnapShotReady] = useState(false);

  // ✅ NUEVO: Estado para controlar precedencia
  const [isSnapshotUpdated, setIsSnapshotUpdated] = useState(false);
  const [restoredSnapshotUrl, setRestoredSnapshotUrl] = useState(null);

  const viewpointsRef = useRef(null);

  // Inicializar viewpoints
  useEffect(() => {
    if (!component || !world) return;

    const viewpoints = component.get(OBC.Viewpoints);
    viewpoints.world = world;
    viewpointsRef.current = viewpoints;

    return () => {
      // Cleanup: revocar URLs al desmontar
      if (snapshotUrl) {
        URL.revokeObjectURL(snapshotUrl);
      }
      if (restoredSnapshotUrl) {
        URL.revokeObjectURL(restoredSnapshotUrl);
      }
    };
  }, [component, world]);

  // Limpiar URLs cuando cambie snapshotUrl
  useEffect(() => {
    return () => {
      if (snapshotUrl) {
        URL.revokeObjectURL(snapshotUrl);
      }
      if (restoredSnapshotUrl) {
        URL.revokeObjectURL(restoredSnapshotUrl);
      }
    };
  }, [snapshotUrl, restoredSnapshotUrl]);

  /*useEffect(() => {
    if (viewpoint) {
      updateCameraFromViewpoint(viewpoint);
    }
  }, [viewpoint]);*/

  // Crear nuevo viewpoint
  const createViewpoint = async () => {
    if (!viewpointsRef.current) {
      console.warn('Viewpoints no está inicializado');
      return null;
    }

    try {
      const vp = viewpointsRef.current.create();
      vp.title = "Mi Viewpoint";
      await vp.updateCamera(); // Captura posición actual de cámara
      vp.takeSnapshot(); // Toma un snapshot de la cámara

      setViewpoint(vp);
      updateSnapshotDisplay(vp);
      setSnapShotReady(true);

      // ✅ Marcar como snapshot nuevo (no restaurado)
      setIsSnapshotUpdated(false);

      return vp;
    } catch (error) {
      console.error('Error creando viewpoint:', error);
      return null;
    }
  };

  // ✅ MEJORADO: Actualizar snapshot con precedencia
  const updateSnapshot = async () => {
    if (!viewpoint || !viewpointsRef.current) {
      console.warn('No hay viewpoint para actualizar');
      return;
    }

    try {
      console.log('🔄 Iniciando actualización de snapshot...');

      // 1. Actualizar la cámara y esperar a que termine
      await viewpoint.updateCamera();

      // 2. Tomar un nuevo snapshot
      viewpoint.takeSnapshot();

      // 3. ✅ MARCAR COMO ACTUALIZADO (esto da precedencia sobre el restaurado)
      setIsSnapshotUpdated(true);

      // 4. Usar setTimeout para asegurar que el snapshot se procese
      setTimeout(() => {
        console.log('⏰ Procesando snapshot actualizado...');
        updateSnapshotDisplay(viewpoint);
        console.log('✅ Snapshot actualizado y visualización refrescada');
      }, 100);

    } catch (error) {
      console.error('Error actualizando snapshot:', error);
      setSnapShotReady(false);
    }
  };

  // Actualizar la visualización del snapshot
  const updateSnapshotDisplay = (vp) => {
    if (!vp || !viewpointsRef.current) return;

    try {
      // Obtener los datos del snapshot
      const snapshotData = viewpointsRef.current.snapshots.get(vp.snapshot);

      if (snapshotData) {
        const blob = new Blob([snapshotData], { type: "image/png" });
        const url = URL.createObjectURL(blob);

        // Limpiar URL anterior para evitar memory leaks
        if (snapshotUrl) {
          URL.revokeObjectURL(snapshotUrl);
        }

        setSnapshotUrl(url);
        console.log('📸 Snapshot display actualizado con nueva URL');
      }
    } catch (error) {
      console.error('Error actualizando visualización del snapshot:', error);
    }
  };

  // ✅ MEJORADO: Resetear viewpoint limpiando todos los estados
  const resetViewpoint = () => {
    if (snapshotUrl) {
      URL.revokeObjectURL(snapshotUrl);
    }
    if (restoredSnapshotUrl) {
      URL.revokeObjectURL(restoredSnapshotUrl);
    }

    setViewpoint(null);
    setSnapshotUrl(null);
    setSnapShotReady(false);

    // ✅ Limpiar estados de precedencia
    setIsSnapshotUpdated(false);
    setRestoredSnapshotUrl(null);
  };

  // Obtener datos del snapshot para guardar
  const getSnapshotData = () => {
    if (!viewpoint || !viewpointsRef.current) {
      return null;
    }

    try {
      // Obtener los datos del snapshot como ArrayBuffer
      const snapshotData = viewpointsRef.current.snapshots.get(viewpoint.snapshot);

      if (snapshotData) {
        // Convertir ArrayBuffer a base64 para almacenamiento
        const uint8Array = new Uint8Array(snapshotData);
        const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const base64String = btoa(binaryString);

        console.log(snapshotData);

        return {
          imageData: base64String,
          viewpointData: {
            guid: viewpoint.guid,
            title: viewpoint.title,
            snapshot: viewpoint.snapshot,
            // Datos de la cámara
            camera: viewpoint.camera ? {
              camera_view_point: viewpoint.camera.camera_view_point,
              camera_direction: viewpoint.camera.camera_direction,
              camera_up_vector: viewpoint.camera.camera_up_vector,
              aspect_ratio: viewpoint.camera.aspect_ratio,
              // Para cámara perspectiva  
              ...(viewpoint.camera.field_of_view && { field_of_view: viewpoint.camera.field_of_view }),
              // Para cámara ortográfica  
              ...(viewpoint.camera.view_to_world_scale && { view_to_world_scale: viewpoint.camera.view_to_world_scale })
            } : null
          }
        };
      }
    } catch (error) {
      console.error('Error obteniendo datos del snapshot:', error);
    }

    return null;
  };

  // ✅ MEJORADO: Restaurar snapshot con lógica de precedencia
  const restoreSnapshot = async (snapshotData) => {
    if (!snapshotData || !viewpointsRef.current) {
      return;
    }

    try {
      console.log('📂 Restaurando snapshot desde DB...');

      // 1. Restaurar la imagen del snapshot desde base64
      if (snapshotData.imageData) {
        // Convertir base64 de vuelta a blob
        const binaryString = atob(snapshotData.imageData);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: "image/png" });
        const url = URL.createObjectURL(blob);

        // ✅ Guardar URL restaurada por separado
        if (restoredSnapshotUrl) {
          URL.revokeObjectURL(restoredSnapshotUrl);
        }
        setRestoredSnapshotUrl(url);

        // ✅ Solo mostrar si NO se ha actualizado el snapshot
        if (!isSnapshotUpdated) {
          if (snapshotUrl) {
            URL.revokeObjectURL(snapshotUrl);
          }
          setSnapshotUrl(url);
          console.log('📸 Mostrando snapshot restaurado de DB');
        } else {
          console.log('⚠️ Snapshot restaurado disponible pero NO se muestra (precedencia a actualizado)');
        }

        setSnapShotReady(true);
      }

      // 2. Crear viewpoint funcional para permitir actualizaciones
      if (snapshotData.viewpointData) {
        const vpData = snapshotData.viewpointData;

        // Crear un nuevo viewpoint funcional
        const restoredViewpoint = viewpointsRef.current.create();
        restoredViewpoint.title = vpData.title || "Viewpoint Restaurado";

        // Restaurar datos de la cámara si existen
        if (vpData.camera) {
          restoredViewpoint.camera = vpData.camera;
        }
        await restoredViewpoint.updateCamera();

        setViewpoint(restoredViewpoint);

        // ✅ Resetear flag de actualización al restaurar
        setIsSnapshotUpdated(false);

        console.log('✅ Viewpoint restaurado exitosamente', restoredViewpoint);
      }
    } catch (error) {
      console.error('Error restaurando snapshot:', error);
    }
  };

  // ✅ NUEVO: Función para obtener la URL correcta según precedencia
  const getCurrentSnapshotUrl = () => {
    if (isSnapshotUpdated && snapshotUrl) {
      return snapshotUrl; // Snapshot actualizado tiene precedencia
    }
    return snapshotUrl || restoredSnapshotUrl; // Fallback al restaurado
  };

  // Función para aplicar la orientación del viewpoint a la cámara  
  const updateCameraFromViewpoint = async (savedViewPointData, transition = true) => {
    if (!viewpointsRef.current || !savedViewPointData) {
      return;
    }

    try {

      // Crear un viewpoint temporal con los datos guardados  
      const tempViewpoint = viewpointsRef.current.create();
      // Configurar los datos de la cámara  
      tempViewpoint.camera = savedViewPointData.camera;
      // Esta es la función clave que actualiza la cámara  
      await tempViewpoint.go({
        transition: transition,        // Animación suave  
        applyClippings: false,    // Aplicar planos de corte  
        applyVisibility: false,   // Aplicar configuración de visibilidad  
        clippingsVisibility: false // Mostrar planos de corte  
      });
      // Limpiar el viewpoint temporal  
      viewpointsRef.current.list.delete(tempViewpoint.guid);

      console.log('Cámara actualizada exitosamente', savedViewPointData);
    } catch (error) {
      console.error('Error al actualizar la cámara:', error);
    }
  };

  return {
    viewpoint,
    snapshotUrl: getCurrentSnapshotUrl(), // ✅ Usar función de precedencia
    snapShotReady,
    viewpointsRef,
    createViewpoint,
    updateSnapshot,
    updateSnapshotDisplay,
    resetViewpoint,
    getSnapshotData,
    restoreSnapshot,
    updateCameraFromViewpoint,

    // ✅ NUEVO: Estados adicionales para debugging
    isSnapshotUpdated,
    hasRestoredSnapshot: !!restoredSnapshotUrl,
  };
};