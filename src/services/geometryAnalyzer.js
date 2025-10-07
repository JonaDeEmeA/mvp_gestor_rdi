import { TIMING } from '../constants/viewerConfig';

/**
 * Analiza la geometría de un modelo de fragmentos
 * @param {Object} fragmentModel - Modelo de fragmentos a analizar
 */
export const analyzeModelGeometry = (fragmentModel) => {
  try {
    if (!fragmentModel?.object?.children) {
      console.warn('No se puede analizar geometría: modelo inválido');
      return;
    }

    setTimeout(() => {
      try {
        console.log('Meshes cargados:', fragmentModel.object.children.length);
      } catch (error) {
        console.error('Error analizando meshes:', error);
      }
    }, TIMING.geometryAnalysisDelay);

    setTimeout(() => {
      try {
        let totalVertices = 0;
        fragmentModel.object.children.forEach((mesh, meshIndex) => {
          if (mesh.geometry?.attributes?.position) {
            const vertices = mesh.geometry.attributes.position.count;
            totalVertices += vertices;
            console.log(`Mesh ${meshIndex}: ${vertices} vértices, Material: ${mesh.material?.type || 'N/A'}`);
          }
        });
        console.log('Total de vértices en el modelo:', totalVertices);
      } catch (error) {
        console.error('Error analizando vértices:', error);
      }
    }, TIMING.geometryAnalysisDelay);
    
  } catch (error) {
    console.error('Error en análisis de geometría:', error);
  }
};

/**
 * Guarda un archivo de fragmentos
 * @param {Uint8Array} fragmentBytes - Bytes del fragmento
 * @param {string} fileName - Nombre del archivo
 * @throws {Error} Si hay error guardando el archivo
 */
export const saveFragmentFile = async (fragmentBytes, fileName) => {
  try {
    if (!fragmentBytes || fragmentBytes.length === 0) {
      throw new Error('No hay datos de fragmentos para guardar');
    }

    if (!fileName || fileName.trim().length === 0) {
      throw new Error('Nombre de archivo no válido');
    }

    const blob = new Blob([fragmentBytes], {
      type: 'application/octet-stream'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    console.log(`Archivo ${fileName} guardado exitosamente`);

  } catch (error) {
    console.error('Error guardando fragmento:', error);
    throw new Error(`Error guardando archivo "${fileName}": ${error.message}`);
  }
};