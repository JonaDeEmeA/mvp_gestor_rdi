/**
 * Interfaz del repositorio de avance de obra.
 *
 * Define el contrato que deben implementar todos los repositorios
 * (IndexedDB, Firebase, etc.). Los métodos devuelven objetos planos.
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
];
