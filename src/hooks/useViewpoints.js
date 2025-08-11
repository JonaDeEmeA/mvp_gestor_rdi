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

  return {
    viewpoint,
    snapshotUrl,
    snapShotReady,
    viewpointsRef,
    createViewpoint,
    updateSnapshot,
    updateSnapshotDisplay,
    resetViewpoint,
  };
};