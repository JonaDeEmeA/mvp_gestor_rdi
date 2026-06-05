import * as OBC from "@thatopen/components";
import { analyzeModelGeometry, saveFragmentFile } from './geometryAnalyzer';

/**
 * Procesa un archivo IFC y lo convierte a fragmentos
 * @param {File} selectedFile - Archivo IFC seleccionado
 * @param {Object} components - Componentes de ThatOpen
 * @param {Object} fragmentsManager - Gestor de fragmentos
 * @param {Object} world - Mundo 3D
 * @returns {Promise<Object>} Modelo de fragmentos procesado
 */
export const processIfcFile = async (selectedFile, components, fragmentsManager, world, options = {}) => {
  try {
    console.log(`Iniciando procesamiento de archivo IFC: ${selectedFile.name}`);

    if (!selectedFile || !components) {
      throw new Error('Parámetros requeridos faltantes para procesar archivo IFC');
    }

    const fileBuffer = await selectedFile.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Usar IfcLoader para cargar IFC con todos los atributos y relaciones
    console.log('Inicializando IfcLoader...');
    const ifcLoader = components.get(OBC.IfcLoader);
    await ifcLoader.setup({
      wasm: { path: '/web-ifc/', absolute: true },
      autoSetWasm: false,
    });

    console.log('Cargando IFC con todos los atributos...');
    const model = await ifcLoader.load(fileBytes, false, selectedFile.name, {
      instanceCallback: (importer) => {
        importer.includeUniqueAttributes = true;
        importer.includeRelationNames = true;
        if (importer.attributesToExclude) {
          importer.attributesToExclude.clear();
        }
      },
    });

    if (!model) {
      throw new Error('No se pudo cargar el modelo IFC');
    }

    console.log('Modelo IFC cargado exitosamente:', model.modelId);

    // Obtener el modelo desde fragmentsManager.list
    const fragmentModel = fragmentsManager.list.get(model.modelId);

    if (!fragmentModel) {
      // Si no está en la lista, puede estar con otro ID
      const modelEntry = fragmentsManager.list.get(selectedFile.name);
      if (!modelEntry) {
        throw new Error('No se pudo obtener el modelo de fragmentos después de la carga');
      }
    }

    const finalModel = fragmentModel || fragmentsManager.list.get(selectedFile.name);

    // Analizar geometría de manera asíncrona
    if (finalModel) {
      analyzeModelGeometry(finalModel);
    }

    // Guardar como .frag usando getBuffer
    try {
      const fragmentFileName = selectedFile.name.replace('.ifc', '.frag').replace('.ifcxml', '.frag');
      const fragmentBytes = await model.getBuffer(false);

      if (options?.onFragGenerated) {
        const savedLocally = await options.onFragGenerated(fragmentFileName, new Uint8Array(fragmentBytes));
        if (!savedLocally) {
          console.warn(
            `⚠️ No se pudo guardar "${fragmentFileName}" en la carpeta local. ` +
            'Reconecta la carpeta desde el panel de Modelos para obtener permisos de escritura.'
          );
        }
      } else {
        await saveFragmentFile(new Uint8Array(fragmentBytes), fragmentFileName);
      }
    } catch (saveError) {
      console.warn('Error guardando archivo .frag:', saveError);
    }

    // Configurar en la escena
    model.useCamera(world?.camera?.three);
    if (world?.scene?.three) {
      world.scene.three.add(model.object);
    }
    await fragmentsManager.core.update(true);

    console.log(`Archivo IFC ${selectedFile.name} procesado exitosamente`);
    return finalModel || model;

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