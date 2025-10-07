import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { showErrorMessage } from '../utils/errorHandler';

/**
 * Hook personalizado para manejar el estado del viewer
 * @returns {Object} Estados y funciones del viewer
 */
export const useViewerState = () => {
  const [importedModels, setImportedModels] = useState([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showRDIManager, setShowRDIManager] = useState(false);

  // Hook para detectar dispositivos móviles
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Manejadores de eventos para UI
  const toggleBrowser = () => {
    setShowBrowser(!showBrowser);
  };
  
  const toggleRDIManager = () => {
    setShowRDIManager(!showRDIManager);
  };

  const createToggleModelVisibility = (fragmentsRef) => (modelId) => {
    try {
      console.log('Modelos importados:', importedModels);

      if (importedModels.length > 0) {
        const targetModel = importedModels.find(model => model.object.uuid === modelId);
        if (targetModel) {
          targetModel.object.visible = !targetModel.object.visible;
          if (fragmentsRef?.current) {
            fragmentsRef.current.core.update(true);
          }
          setImportedModels([...importedModels]);
          console.log(`Visibilidad del modelo ${modelId} cambiada a: ${targetModel.object.visible}`);
        } else {
          console.warn(`Modelo con ID ${modelId} no encontrado`);
        }
      }
    } catch (error) {
      console.error('Error cambiando visibilidad del modelo:', error);
      showErrorMessage('Error cambiando visibilidad del modelo', error);
    }
  };

  // Función placeholder para exportBCF
  

  return {
    importedModels,
    setImportedModels,
    showBrowser,
    showRDIManager,
    isMobile,
    toggleBrowser,
    toggleRDIManager,
    createToggleModelVisibility,
    
  };
};