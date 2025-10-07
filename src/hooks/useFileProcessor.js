import { useRef } from 'react';
import { processIfcFile, processFragFile, processJsonFile } from '../services/fileProcessorService';
import { showErrorMessage } from '../utils/errorHandler';
import { VIEWER_CONFIG, ERROR_MESSAGES } from '../constants/viewerConfig';

/**
 * Hook personalizado para manejar el procesamiento de archivos
 * @param {Object} worldRef - Referencia al mundo 3D
 * @param {Object} fragmentsRef - Referencia al gestor de fragmentos
 * @param {Function} setImportedModels - Función para actualizar modelos importados
 * @returns {Object} Funciones para manejar archivos
 */
export const useFileProcessor = (worldRef, fragmentsRef, setImportedModels) => {
  const fileInputRef = useRef(null);

  const openFileDialog = () => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Permite seleccionar el mismo archivo varias veces
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('Error abriendo diálogo de archivos:', error);
      showErrorMessage('Error abriendo selector de archivos', error);
    }
  };

  const handleFileSelection = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const world = worldRef.current;
    const fragmentsManager = fragmentsRef.current;

    // Validaciones iniciales
    if (!fragmentsManager) {
      showErrorMessage(ERROR_MESSAGES.FRAGMENTS_MANAGER);
      return;
    }

    if (!VIEWER_CONFIG.supportedExtensions.includes(fileExtension)) {
      showErrorMessage(`${ERROR_MESSAGES.UNSUPPORTED_FORMAT}. Extensiones válidas: ${VIEWER_CONFIG.supportedExtensions.join(', ')}`);
      return;
    }

    try {
      let processedModel = null;

      switch (fileExtension) {
        case 'ifc':
          processedModel = await processIfcFile(selectedFile, fragmentsManager, world);
          setImportedModels(previousModels => [...previousModels, processedModel]);
          break;

        case 'frag':
          processedModel = await processFragFile(selectedFile, fragmentsManager, world);
          setImportedModels(previousModels => [...previousModels, processedModel]);
          break;

        case 'json':
          await processJsonFile(selectedFile);
          break;

        default:
          throw new Error(`Extensión no soportada: ${fileExtension}`);
      }

      console.log(`Archivo ${selectedFile.name} procesado exitosamente`);
      
    } catch (error) {
      console.error('Error procesando archivo:', error);
      showErrorMessage(ERROR_MESSAGES.FILE_PROCESSING, error);
    }
  };

  return {
    fileInputRef,
    openFileDialog,
    handleFileSelection
  };
};