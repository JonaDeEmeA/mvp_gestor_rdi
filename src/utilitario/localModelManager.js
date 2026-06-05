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
      mode: 'readwrite'
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
    const permission = await handle.queryPermission({ mode: 'readwrite' });
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
  const permission = await handle.requestPermission({ mode: 'readwrite' });
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

/**
 * Guarda un archivo de bytes en la carpeta local.
 * Solicita permiso de lectura/escritura si aún no se cuenta con él.
 * @param {FileSystemDirectoryHandle} folderHandle
 * @param {string} fileName
 * @param {Uint8Array} fileBytes
 * @returns {Promise<boolean>}
 */
/**
 * Guarda un archivo de bytes en la carpeta local.
 * IMPORTANTE: Solo consulta el permiso (queryPermission), NUNCA llama a requestPermission.
 * El permiso de escritura debe haber sido solicitado previamente durante la acción del usuario
 * al conectar la carpeta (showDirectoryPicker con mode: 'readwrite').
 * @param {FileSystemDirectoryHandle} folderHandle
 * @param {string} fileName
 * @param {Uint8Array} fileBytes
 * @returns {Promise<boolean>}
 */
export const saveFileToFolder = async (folderHandle, fileName, fileBytes) => {
  if (!folderHandle) return false;
  try {
    // Solo verificar el permiso actual — no solicitar (evita SecurityError en contextos async)
    const permission = await folderHandle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      console.warn(
        'Sin permiso de escritura en la carpeta local. ' +
        'Reconecta la carpeta para que el sistema pueda guardar archivos .frag automáticamente.'
      );
      return false;
    }

    const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(fileBytes);
    await writable.close();

    console.log(`✅ Archivo ${fileName} guardado automáticamente en el repositorio local.`);
    return true;
  } catch (error) {
    console.error('Error guardando archivo en la carpeta local:', error);
    return false;
  }
};

