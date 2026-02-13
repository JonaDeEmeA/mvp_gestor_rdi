import { useEffect, useRef, useState, useCallback } from 'react';
import * as OBC from '@thatopen/components';

export const useSection = (component, world, containerRef, isViewerReady) => {
  const [enabled, setEnabled] = useState(false);
  const [planesList, setPlanesList] = useState([]);
  const clipperRef = useRef(null);

  // Sincroniza el estado local con la realidad del Clipper
  const syncPlanes = useCallback(() => {
    if (!clipperRef.current) return;

    // El clipper puede almacenar los planos en .list (Map) o .planes (Set)
    const planes = clipperRef.current.list || clipperRef.current.planes || [];

    let planesArray = [];
    if (planes instanceof Map) {
      planesArray = Array.from(planes.values());
    } else if (planes instanceof Set) {
      planesArray = Array.from(planes);
    } else {
      planesArray = Array.from(planes);
    }

    setPlanesList(planesArray);
  }, []);

  useEffect(() => {
    if (!isViewerReady || !component || !world) return;

    const clipper = component.get(OBC.Clipper);
    clipperRef.current = clipper;

    // Escuchar cambios externos (como doble clic o atajos de teclado)
    const onAfterChange = () => syncPlanes();

    // Suscribirse a todos los posibles nombres de eventos según versión
    if (clipper.onAfterCreate) clipper.onAfterCreate.add(onAfterChange);
    if (clipper.onAfterDelete) clipper.onAfterDelete.add(onAfterChange);
    if (clipper.onCreated) clipper.onCreated.add(onAfterChange);
    if (clipper.onDeleted) clipper.onDeleted.add(onAfterChange);

    const handleDoubleClick = () => {
      if (clipper.enabled) {
        clipper.create(world);
      }
    };

    const handleKeyDown = (event) => {
      if (event.code === 'Delete' || event.code === 'Backspace') {
        if (clipper.enabled) clipper.delete(world);
      }
    };

    const container = containerRef.current;
    if (container) container.addEventListener('dblclick', handleDoubleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (container) container.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('keydown', handleKeyDown);

      if (clipper.onAfterCreate) clipper.onAfterCreate.remove(onAfterChange);
      if (clipper.onAfterDelete) clipper.onAfterDelete.remove(onAfterChange);
      if (clipper.onCreated) clipper.onCreated.remove(onAfterChange);
      if (clipper.onDeleted) clipper.onDeleted.remove(onAfterChange);
    };
  }, [component, world, containerRef, syncPlanes, isViewerReady]);

  const toggle = () => {
    if (!clipperRef.current) return;
    const newState = !enabled;
    setEnabled(newState);
    clipperRef.current.enabled = newState;
    if (newState) syncPlanes();
  };

  const deletePlane = (plane) => {
    if (!clipperRef.current) return;

    // 1. Borrado del ESCENARIO y del Motor 3D
    try {
      // Intentar el método oficial
      if (world) {
        clipperRef.current.delete(world, plane);
      } else {
        clipperRef.current.delete(plane);
      }

      // LIMPIEZA MANUAL: Algunos componentes de ThatOpen no limpian su propia lista interna al usar delete(world, plane)
      ['list', 'planes'].forEach(collectionName => {
        const collection = clipperRef.current[collectionName];
        if (!collection) return;

        if (collection instanceof Set) {
          collection.delete(plane);
        } else if (collection instanceof Map) {
          for (const [key, value] of collection.entries()) {
            if (value === plane) {
              collection.delete(key);
              break;
            }
          }
        }
      });

      // Fallback físico: asegurar que el objeto desaparezca de la vista y se destruya
      if (plane && typeof plane.dispose === 'function') {
        plane.dispose();
      }
    } catch (e) {
      console.warn("Aviso en el borrado manual:", e);
    }

    // 2. Sincronizar el estado de React inmediatamente
    syncPlanes();
  };

  const togglePlane = (plane) => {
    if (!plane) return;
    plane.enabled = !plane.enabled;
    syncPlanes();
  };

  return { enabled, planesList, toggle, deletePlane, togglePlane };
};