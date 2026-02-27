import * as FRAGS from '@thatopen/fragments';
import { IFC_SETTINGS } from '../constants/viewerConfig';
import { analyzeModelGeometry, saveFragmentFile } from './geometryAnalyzer';

/**
 * Procesa un archivo IFC y lo convierte a fragmentos
 * @param {File} selectedFile - Archivo IFC seleccionado
 * @param {Object} fragmentsManager - Gestor de fragmentos
 * @param {Object} world - Mundo 3D
 * @returns {Promise<Object>} Modelo de fragmentos procesado
 * @throws {Error} Si hay error en el procesamiento del archivo IFC
 */
export const processIfcFile = async (selectedFile, fragmentsManager, world) => {
  try {
    console.log(`Iniciando procesamiento de archivo IFC: ${selectedFile.name}`);

    // Validar parámetros
    if (!selectedFile || !fragmentsManager || !world) {
      throw new Error('Parámetros requeridos faltantes para procesar archivo IFC');
    }

    const ifcSerializer = new FRAGS.IfcImporter();
    ifcSerializer.wasm = { absolute: true, path: '/web-ifc/' };
    ifcSerializer.settings = IFC_SETTINGS;

    const fileBuffer = await selectedFile.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Procesar IFC a fragmentos
    console.log('Procesando IFC a fragmentos...');
    const fragmentBytes = await ifcSerializer.process({ bytes: fileBytes });

    if (!fragmentBytes || fragmentBytes.length === 0) {
      throw new Error('No se pudieron generar fragmentos del archivo IFC');
    }

    console.log('Fragmentos generados:', fragmentBytes.length, 'bytes');

    // Cargar en el gestor de fragmentos
    console.log('Cargando fragmentos en el gestor...');
    const loadedModel = await fragmentsManager.core.load(fragmentBytes, {
      modelId: selectedFile.name,
      coordinate: IFC_SETTINGS.coordinate,
      properties: IFC_SETTINGS.includeProperties
    });

    // Verificar geometría cargada
    const fragmentModel = fragmentsManager.list.get(selectedFile.name);

    if (!fragmentModel) {
      throw new Error('No se pudo obtener el modelo de fragmentos después de la carga');
    }

    console.log('Modelo IFC cargado exitosamente:', fragmentModel);
    console.log('Propiedades disponibles:', Object.keys(fragmentModel));

    // Analizar geometría de manera asíncrona
    analyzeModelGeometry(fragmentModel);

    // Guardar como .frag
    try {
      const fragmentFileName = selectedFile.name.replace('.ifc', '.frag');
      await saveFragmentFile(fragmentBytes, fragmentFileName);
    } catch (saveError) {
      console.warn('Error guardando archivo .frag:', saveError);
      // No interrumpir el proceso por error de guardado
    }

    // Configurar en la escena
    loadedModel.useCamera(world.camera.three);
    world.scene.three.add(loadedModel.object);
    await fragmentsManager.core.update(true);

    console.log(`Archivo IFC ${selectedFile.name} procesado exitosamente`);
    return fragmentModel;

  } catch (error) {
    console.error('Error procesando archivo IFC:', error);
    throw new Error(`Error procesando archivo IFC "${selectedFile.name}": ${error.message}`);
  }
};

/**
 * Procesa un archivo FRAG
 * @param {File} selectedFile - Archivo FRAG seleccionado
 * @param {Object} fragmentsManager - Gestor de fragmentos
 * @param {Object} world - Mundo 3D
 * @returns {Promise<Object>} Modelo de fragmentos procesado
 * @throws {Error} Si hay error en el procesamiento del archivo FRAG
 */
export const processFragFile = async (selectedFile, fragmentsManager, world) => {
  try {
    console.log(`Iniciando procesamiento de archivo FRAG: ${selectedFile.name}`);

    // Validar parámetros
    if (!selectedFile || !fragmentsManager || !world) {
      throw new Error('Parámetros requeridos faltantes para procesar archivo FRAG');
    }

    const fileBuffer = await selectedFile.arrayBuffer();

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      throw new Error('Archivo FRAG vacío o corrupto');
    }

    const loadedModel = await fragmentsManager.core.load(fileBuffer, { modelId: selectedFile.name });
    const fragmentModel = fragmentsManager.list.get(selectedFile.name);

    if (!fragmentModel) {
      throw new Error('No se pudo cargar el modelo FRAG');
    }

    console.log('Fragment cargado exitosamente:', fragmentModel);
    console.log('Propiedades disponibles:', Object.keys(fragmentModel));

    // Analizar geometría de manera asíncrona
    analyzeModelGeometry(fragmentModel);

    // Configurar en la escena
    loadedModel.useCamera(world.camera.three);
    world.scene.three.add(loadedModel.object);
    await fragmentsManager.core.update(true);

    console.log(`Archivo FRAG ${selectedFile.name} procesado exitosamente`);
    return fragmentModel;

  } catch (error) {
    console.error('Error procesando archivo FRAG:', error);
    throw new Error(`Error procesando archivo FRAG "${selectedFile.name}": ${error.message}`);
  }
};

/**
 * Procesa un archivo JSON
 * @param {File} selectedFile - Archivo JSON seleccionado
 * @returns {Promise<Object>} Datos JSON parseados
 * @throws {Error} Si hay error en el procesamiento del archivo JSON
 */
export const processJsonFile = async (selectedFile) => {
  try {
    console.log(`Iniciando procesamiento de archivo JSON: ${selectedFile.name}`);

    if (!selectedFile) {
      throw new Error('Archivo JSON no proporcionado');
    }

    const fileText = await selectedFile.text();

    if (!fileText || fileText.trim().length === 0) {
      throw new Error('Archivo JSON vacío');
    }

    const jsonData = JSON.parse(fileText);
    window.selectedJson = jsonData;

    console.log(`Archivo JSON ${selectedFile.name} cargado exitosamente`);
    console.log('Datos JSON:', jsonData);

    return jsonData;

  } catch (error) {
    console.error('Error procesando archivo JSON:', error);

    if (error instanceof SyntaxError) {
      throw new Error(`Archivo JSON inválido "${selectedFile.name}": formato JSON incorrecto`);
    }

    throw new Error(`Error procesando archivo JSON "${selectedFile.name}": ${error.message}`);
  }
};