/**
 * localModelManager.js
 * 
 * Capa de abstracción para el manejo de modelos locales usando la File System Access API.
 * Diseñada para ser desacoplable: si en el futuro se usa una DB en la nube, 
 * solo se debe cambiar esta implementación o el hook que la consume.
 */

import { get, set, del } from 'idb-keyval';

const STORAGE_KEY = 'local_models_folder_handle';

/**
 * Verifica si el navegador soporta la File System Access API.
 */
export const isFileSystemApiSupported = () => {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
};

/**
 * Solicita al usuario permiso para acceder a una carpeta.
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export const requestFolderPermission = async () => {
  if (!isFileSystemApiSupported()) {
    throw new Error('Tu navegador no soporta el acceso a carpetas locales. Por favor usa Chrome, Edge u Opera.');
  }
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'read'
    });
    
    // Guardar el handle en IndexedDB para persistencia entre sesiones
    await set(STORAGE_KEY, handle);
    return handle;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error('Error al solicitar permiso de carpeta:', error);
    throw error;
  }
};

/**
 * Recupera el handle guardado de la carpeta.
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export const getSavedFolderHandle = async () => {
  try {
    const handle = await get(STORAGE_KEY);
    if (!handle) return null;

    // Verificar si aún tenemos permiso (el navegador suele pedir confirmación al recargar)
    const permission = await handle.queryPermission({ mode: 'read' });
    if (permission === 'granted') return handle;
    
    return handle; // Devolvemos el handle aunque necesite re-verificación
  } catch (error) {
    console.error('Error al recuperar handle guardado:', error);
    return null;
  }
};

/**
 * Solicita re-verificar el permiso si es necesario.
 */
export const verifyPermission = async (handle) => {
  if (!handle) return false;
  const permission = await handle.requestPermission({ mode: 'read' });
  return permission === 'granted';
};

/**
 * Lista archivos IFC y Fragments dentro del handle proporcionado.
 */
export const listModelsInFolder = async (handle) => {
  if (!handle) return [];
  
  const models = [];
  try {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const name = entry.name.toLowerCase();
        if (name.endsWith('.ifc') || name.endsWith('.ifcxml') || name.endsWith('.frag')) {
          models.push({
            name: entry.name,
            kind: 'file',
            handle: entry,
            id: btoa(entry.name) // ID temporal basado en nombre
          });
        }
      }
    }
    return models;
  } catch (error) {
    console.error('Error al listar archivos:', error);
    throw error;
  }
};

/**
 * Obtiene un objeto File a partir de un handle de archivo.
 */
export const getFileFromHandle = async (fileHandle) => {
  return await fileHandle.getFile();
};

/**
 * Elimina el vínculo con la carpeta local.
 */
export const disconnectFolder = async () => {
  await del(STORAGE_KEY);
};
