import * as OBC from "@thatopen/components";
import { VIEWER_CONFIG, ERROR_MESSAGES } from '../constants/viewerConfig';

/**
 * Inicializa el visor 3D con todos sus componentes
 * @param {HTMLElement} container - Elemento DOM contenedor del visor
 * @param {Object} refs - Referencias a los componentes del visor
 * @returns {Promise<Object>} Objeto con los componentes inicializados
 * @throws {Error} Si hay error en la inicialización
 */
export const initializeViewer = async (container, refs) => {
  try {
    console.log('Iniciando inicialización del visor 3D...');
    
    if (!container) {
      throw new Error('Contenedor DOM no disponible');
    }

    const BUI = await import('@thatopen/ui');

    // Crear componentes principales
    const components = new OBC.Components();
    refs.componentsRef.current = components;

    // Configurar mundo 3D
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();
    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.OrthoPerspectiveCamera(components);
    
    // Inicializar componentes
    await components.init();
    
    // Configurar controles de cámara
    if (!world.camera.controls.object && world.camera.three) {
      world.camera.controls.object = world.camera.three;
    }
    
    const cameraControls = world.camera.controls;
    world.scene.three.background = null;
    
    // Establecer posición inicial de la cámara
    cameraControls.setLookAt(
      VIEWER_CONFIG.camera.position.x,
      VIEWER_CONFIG.camera.position.y,
      VIEWER_CONFIG.camera.position.z,
      ...VIEWER_CONFIG.camera.target
    );
    
    world.scene.setup();

    // Crear grilla
    const grids = components.get(OBC.Grids);
    grids.create(world);

    // Configurar gestor de fragmentos
    const fragmentsManager = components.get(OBC.FragmentsManager);
    fragmentsManager.init(VIEWER_CONFIG.workerUrl);

    // Guardar referencias
    refs.worldRef.current = world;
    refs.fragmentsRef.current = fragmentsManager;

    world.camera.controls.addEventListener('update', () => {
        fragmentsManager.core.update(true);  
      });

    console.log('Visor 3D inicializado correctamente');
    
    return {
      components,
      world,
      fragmentsManager,
      cameraControls
    };
    
  } catch (error) {
    console.error('Error inicializando visor:', error);
    throw new Error(`${ERROR_MESSAGES.VIEWER_INIT}: ${error.message}`);
  }
};

/**
 * Limpia los recursos del visor al desmontar el componente
 * @param {Object} refs - Referencias a los componentes del visor
 */
export const cleanupViewer = (refs) => {
  try {
    if (refs.componentsRef.current) {
      refs.componentsRef.current.dispose();
    }
    
    // Eliminar panel de controles si existe
    const existingPanel = document.getElementById('controls-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    console.log('Recursos del visor limpiados correctamente');
    
  } catch (error) {
    console.error('Error limpiando recursos del visor:', error);
  }
};