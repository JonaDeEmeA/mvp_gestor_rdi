/**
 * useLocalModels.js
 * 
 * Hook para gestionar la lista de modelos desde una carpeta local.
 * Abstrae la lógica de permisos y escaneo de archivos.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getSavedFolderHandle, 
  requestFolderPermission, 
  listModelsInFolder, 
  verifyPermission,
  disconnectFolder,
  getFileFromHandle,
  isFileSystemApiSupported
} from '../utilitario/localModelManager';

export const useLocalModels = () => {
  const [isSupported, setIsSupported] = useState(true);
  const [folderHandle, setFolderHandle] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsPermission, setNeedsPermission] = useState(false);

  // Cargar handle guardado al iniciar
  useEffect(() => {
    setIsSupported(isFileSystemApiSupported());
    const init = async () => {
      try {
        const handle = await getSavedFolderHandle();
        if (handle) {
          setFolderHandle(handle);
          // Verificar si ya tenemos permiso
          const hasPermission = (await handle.queryPermission()) === 'granted';
          if (hasPermission) {
            const fileList = await listModelsInFolder(handle);
            setModels(fileList);
          } else {
            setNeedsPermission(true);
          }
        }
      } catch (error) {
        console.error('Error inicializando modelos locales:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      const handle = await requestFolderPermission();
      if (handle) {
        setFolderHandle(handle);
        const fileList = await listModelsInFolder(handle);
        setModels(fileList);
        setNeedsPermission(false);
      }
    } catch (error) {
      console.error('Error al conectar carpeta:', error);
    } finally {
      setLoading(false);
    }
  };

  const authorize = async () => {
    if (!folderHandle) return;
    try {
      const granted = await verifyPermission(folderHandle);
      if (granted) {
        const fileList = await listModelsInFolder(folderHandle);
        setModels(fileList);
        setNeedsPermission(false);
      }
    } catch (error) {
      console.error('Error al autorizar carpeta:', error);
    }
  };

  const disconnect = async () => {
    await disconnectFolder();
    setFolderHandle(null);
    setModels([]);
    setNeedsPermission(false);
  };

  const refresh = useCallback(async () => {
    if (!folderHandle || needsPermission) return;
    try {
      const fileList = await listModelsInFolder(folderHandle);
      setModels(fileList);
    } catch (error) {
      console.error('Error al refrescar modelos:', error);
    }
  }, [folderHandle, needsPermission]);

  return {
    models,
    loading,
    folderHandle,
    needsPermission,
    isSupported,
    connect,
    authorize,
    disconnect,
    refresh,
    getFileFromHandle
  };
};
