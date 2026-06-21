export const IMetadataRepositoryMethods = [
  // ─── Metadata CRUD por GlobalId ───────────────────────────────
  'getByGlobalId',
  'getByGlobalIds',
  'save',
  'update',
  'delete',
  'getAllByProject',
  'getAllByIfcVersion',
  'getByElementStatus',
  'count',

  // ─── Sincronización de versiones IFC ──────────────────────────
  'getAllGlobalIds',
  'batchUpdateSyncStatus',

  // ─── Clasificación ────────────────────────────────────────────
  'getByClassification',
  'getBySpecialty',
  'getByDiscipline',
  'getByChapter',

  // ─── Contractual ──────────────────────────────────────────────
  'getByResponsible',
  'getByCompany',
  'getCriticalPathElements',

  // ─── Producción / Avance ──────────────────────────────────────
  'getByProgressGroup',
  'getByProgressRange',
  'updateProductionData',

  // ─── Económico ────────────────────────────────────────────────
  'getByBudgetRange',
  'updateEconomicData',

  // ─── Gestión: Incidencias ─────────────────────────────────────
  'addIssue',
  'updateIssue',
  'removeIssue',
  'getIssuesByGlobalId',
  'getIssuesByStatus',
  'getIssuesByType',

  // ─── Gestión: Observaciones ───────────────────────────────────
  'addObservation',
  'removeObservation',

  // ─── Gestión: Fotografías ─────────────────────────────────────
  'addPhoto',
  'removePhoto',
  'getPhotosByGlobalId',

  // ─── Gestión: Documentos ──────────────────────────────────────
  'addDocument',
  'removeDocument',
  'getDocumentsByGlobalId',

  // ─── Gestión: Historial ───────────────────────────────────────
  'addHistoryEntry',
  'getHistoryByGlobalId',

  // ─── Analítico ────────────────────────────────────────────────
  'updateAnalyticalData',
  'addAnalyticalSnapshot',
  'getAnalyticalSnapshotsByGlobalId',
  'getAnalyticalSnapshotsByGroup',
  'getKPIByGlobalId',

  // ─── Transacciones batch ──────────────────────────────────────
  'bulkSave',
  'bulkUpdate',
  'bulkDelete',
]

export const IMetadataRepository = {
  methods: IMetadataRepositoryMethods,
  description:
    'Interfaz unificada del Repositorio de Metadatos BIM. ' +
    'Cada elemento se identifica por su GlobalId. ' +
    'Los métodos devuelven objetos planos con la estructura definida en metadataStandards.js.',
}
