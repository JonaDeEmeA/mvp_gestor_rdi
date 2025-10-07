import { useEffect, useRef } from 'react';
import { initializeViewer, cleanupViewer } from '../services/viewer3DService';
import { showErrorMessage } from '../utils/errorHandler';
import { ERROR_MESSAGES } from '../constants/viewerConfig';

/**
 * Hook personalizado para manejar el visor 3D
 * @returns {Object} Referencias y funciones del visor 3D
 */
export const useViewer3D = () => {
  const containerRef = useRef(null);
  const componentsRef = useRef(null);
  const worldRef = useRef(null);
  const fragmentsRef = useRef(null);
  const topicRef = useRef(null);

  // Efecto para inicializar el visor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const refs = {
      componentsRef,
      worldRef,
      fragmentsRef
    };

    // Inicializar el visor
    const setupViewer = async () => {
      try {
        await initializeViewer(containerRef.current, refs);
      } catch (error) {
        showErrorMessage(ERROR_MESSAGES.VIEWER_INIT, error);
      }
    };

    setupViewer();

    // Cleanup al desmontar
    return () => {
      cleanupViewer(refs);
    };
  }, []);

  return {
    containerRef,
    componentsRef,
    worldRef,
    fragmentsRef,
    topicRef
  };
};