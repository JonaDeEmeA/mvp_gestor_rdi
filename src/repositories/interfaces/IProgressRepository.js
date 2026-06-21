/**
 * Interfaz del repositorio de avance de obra.
 *
 * Define el contrato que deben implementar todos los repositorios
 * (IndexedDB, Firebase, etc.). Los métodos devuelven objetos planos.
 *
 * Esta interfaz se alinea con el dominio "production" del schema
 * unificado definido en metadataStandards.js.
 *
 * @interface IProgressRepository
 */

export const IProgressRepositoryMethods = [
  'getGroups',
  'getGroupById',
  'createGroup',
  'updateGroup',
  'deleteGroup',
  'getElementsByGroup',
  'addElementToGroup',
  'removeElementFromGroup',
  'getGroupsByElement',
  'getSnapshotsByGroup',
  'getLatestSnapshotByGroup',
  'createSnapshot',
  'getPhotosBySnapshot',
  'addPhoto',
  'deletePhoto',
  // Jerarquía y ponderación
  'getChildGroups',
  'getRootGroups',
  'getGroupTree',
  'getGroupsByParent',
  // Integración con Metadata Repository (dominio production)
  'getProductionDataForGlobalId',
  'updateProductionDataFromMetadata',
];
