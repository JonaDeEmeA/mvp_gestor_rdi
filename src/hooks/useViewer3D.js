import * as THREE from 'three';
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
  const loadingSphereRef = useRef(null);

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

        // Crear esfera de carga en el centro (0,0,0)  
        createLoadingSphere()

        // Agregar event listener para resize
        const handleResize = () => {
          if (worldRef.current?.renderer) {
            worldRef.current.renderer.resize();
            // Opcional: actualizar también fragments si es necesario
            if (fragmentsRef.current) {
              fragmentsRef.current.core.update(true);
            }
          }
        };

        window.addEventListener('resize', handleResize);
      } catch (error) {
        showErrorMessage(ERROR_MESSAGES.VIEWER_INIT, error);
      }
    };

    const createLoadingSphere = () => {
      if (!worldRef.current) return;

      const scene = worldRef.current.scene.three;

      // Geometría y material para la esfera de carga  
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(0, 0, 0); // Centro exacto de la escena   
      scene.add(sphere);
      loadingSphereRef.current = sphere;

      // PUNTO ROJO en el centro exacto  
      const redPointGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const redPointMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000  // Rojo  
      });
      const redPoint = new THREE.Mesh(redPointGeometry, redPointMaterial);
      redPoint.position.set(0, 0, 0);  // Centro exacto  
      scene.add(redPoint);
    };

    setupViewer();

    // Cleanup al desmontar
    return () => {
      // Eliminar event listener
      const handleResize = () => {
        if (worldRef.current?.renderer) {
          worldRef.current.renderer.resize();
        }
      };
      window.removeEventListener('resize', handleResize);

      // Limpiar esfera antes de cleanup  
      if (loadingSphereRef.current && worldRef.current) {
        worldRef.current.scene.three.remove(loadingSphereRef.current);
      }
      cleanupViewer(refs);
    };
  }, []);

  // Función para remover la esfera cuando termina la carga  
  const removeLoadingSphere = () => {
    if (loadingSphereRef.current && worldRef.current) {
      worldRef.current.scene.three.remove(loadingSphereRef.current);
      loadingSphereRef.current = null;
    }
  };

  return {
    containerRef,
    componentsRef,
    worldRef,
    fragmentsRef,
    topicRef,
    removeLoadingSphere
  };
};