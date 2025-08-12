import { useState, useEffect, useRef } from 'react';
import * as OBC from "@thatopen/components";

export const useViewpoints = (component, world) => {
  const [viewpoint, setViewpoint] = useState(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [snapShotReady, setSnapShotReady] = useState(false);
  
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
    };
  }, [component, world]);

  // Limpiar URLs cuando cambie snapshotUrl
  useEffect(() => {
    return () => {
      if (snapshotUrl) {
        URL.revokeObjectURL(snapshotUrl);
      }
    };
  }, [snapshotUrl]);

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
      
      return vp;
    } catch (error) {
      console.error('Error creando viewpoint:', error);
      return null;
    }
  };

  // Actualizar snapshot existente
  const updateSnapshot = async () => {
    if (!viewpoint || !viewpointsRef.current) {
      console.warn('No hay viewpoint para actualizar');
      return;
    }

    try {
      // Actualizar la cámara y esperar a que termine
      await viewpoint.updateCamera();
      
      // Actualizar la visualización después de que se complete la captura
      updateSnapshotDisplay(viewpoint);
    } catch (error) {
      console.error('Error actualizando snapshot:', error);
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
      }
    } catch (error) {
      console.error('Error actualizando visualización del snapshot:', error);
    }
  };

  // Resetear viewpoint
  const resetViewpoint = () => {
    if (snapshotUrl) {
      URL.revokeObjectURL(snapshotUrl);
    }
    setViewpoint(null);
    setSnapshotUrl(null);
    setSnapShotReady(false);
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
        
        return {
          imageData: base64String,
          viewpointData: {
            guid: viewpoint.guid,
            title: viewpoint.title,
            snapshot: viewpoint.snapshot,
            // Datos de la cámara
            camera: viewpoint.camera ? {
              position: viewpoint.camera.position,
              direction: viewpoint.camera.direction,
              up: viewpoint.camera.up,
              fov: viewpoint.camera.fov
            } : null
          }
        };
      }
    } catch (error) {
      console.error('Error obteniendo datos del snapshot:', error);
    }
    
    return null;
  };

  // Restaurar snapshot desde datos guardados
  const restoreSnapshot = (snapshotData) => {
    if (!snapshotData || !viewpointsRef.current) {
      return;
    }

    try {
      // Restaurar la imagen del snapshot desde base64
      if (snapshotData.imageData) {
        // Convertir base64 de vuelta a blob
        const binaryString = atob(snapshotData.imageData);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([uint8Array], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        
        // Limpiar URL anterior
        if (snapshotUrl) {
          URL.revokeObjectURL(snapshotUrl);
        }
        
        setSnapshotUrl(url);
        setSnapShotReady(true);
      }

      // Si hay datos del viewpoint, intentar recrearlo
      if (snapshotData.viewpointData) {
        const vpData = snapshotData.viewpointData;
        
        // Crear un nuevo viewpoint con los datos guardados
        const restoredViewpoint = viewpointsRef.current.create();
        restoredViewpoint.title = vpData.title || "Viewpoint Restaurado";
        restoredViewpoint.guid = vpData.guid;
        
        // Restaurar datos de la cámara si existen
        if (vpData.camera) {
          restoredViewpoint.camera = vpData.camera;
        }
        
        setViewpoint(restoredViewpoint);
        console.log('Snapshot restaurado exitosamente:', vpData);
      }
    } catch (error) {
      console.error('Error restaurando snapshot:', error);
    }
  };

  return {
    viewpoint,
    snapshotUrl,
    snapShotReady,
    viewpointsRef,
    createViewpoint,
    updateSnapshot,
    updateSnapshotDisplay,
    resetViewpoint,
    getSnapshotData,
    restoreSnapshot,
  };
};