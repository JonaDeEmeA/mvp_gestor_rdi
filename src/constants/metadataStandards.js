export const METADATA_VERSION = '1.0.0'

export const ELEMENT_STATUS = {
  ACTIVE: 'active',
  OBSOLETE: 'obsolete',
  DELETED: 'deleted',
}

export const SYNC_STATUS = {
  CONSERVED: 'conserved',
  NEW: 'new',
  DELETED: 'deleted',
}

export const DOMAINS = {
  CLASSIFICATION: 'classification',
  CONTRACTUAL: 'contractual',
  PRODUCTION: 'production',
  ECONOMIC: 'economic',
  MANAGEMENT: 'management',
  ANALYTICAL: 'analytical',
}

const now = () => new Date().toISOString()

export const createEmptyMetadata = (globalId, baseData = {}) => ({
  globalId,
  projectId: baseData.projectId || null,
  ifcVersionId: baseData.ifcVersionId || null,
  elementStatus: ELEMENT_STATUS.ACTIVE,
  syncStatus: SYNC_STATUS.CONSERVED,
  createdAt: baseData.createdAt || now(),
  updatedAt: now(),
  updatedBy: baseData.updatedBy || '',

  classification: {
    chapter: baseData.classification?.chapter || '',
    subchapter: baseData.classification?.subchapter || '',
    specialty: baseData.classification?.specialty || '',
    discipline: baseData.classification?.discipline || '',
  },

  contractual: {
    responsible: baseData.contractual?.responsible || '',
    company: baseData.contractual?.company || '',
    contract: baseData.contractual?.contract || '',
    isCriticalPath: baseData.contractual?.isCriticalPath ?? false,
  },

  production: {
    progressGroupId: baseData.production?.progressGroupId || null,
    weight: baseData.production?.weight ?? 1.0,
    weightUnit: baseData.production?.weightUnit || 'porcentaje',
    unit: baseData.production?.unit || '',
    quantity: baseData.production?.quantity ?? 0,
    progress: baseData.production?.progress ?? 0,
    plannedProgress: baseData.production?.plannedProgress ?? 0,
  },

  economic: {
    cost: baseData.economic?.cost ?? 0,
    budget: baseData.economic?.budget ?? 0,
    manHours: baseData.economic?.manHours ?? 0,
    economicWeight: baseData.economic?.economicWeight ?? 0,
  },

  management: {
    issues: baseData.management?.issues || [],
    observations: baseData.management?.observations || [],
    photos: baseData.management?.photos || [],
    documents: baseData.management?.documents || [],
    history: baseData.management?.history || [],
  },

  analytical: {
    kpis: baseData.analytical?.kpis || {},
    indicators: baseData.analytical?.indicators || [],
    snapshots: baseData.analytical?.snapshots || [],
  },
})

export const createIssue = (data = {}) => ({
  id: data.id || `issue-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  globalId: data.globalId || '',
  title: data.title || 'Sin título',
  description: data.description || '',
  type: data.type || 'General',
  status: data.status || 'Abierta',
  label: data.label || 'General',
  assignedTo: data.assignedTo || '',
  dueDate: data.dueDate || null,
  priority: data.priority || 'Media',
  createdAt: data.createdAt || now(),
  createdBy: data.createdBy || '',
  updatedAt: now(),
  comments: data.comments || [],
  snapshot: data.snapshot || null,
})

export const createComment = (data = {}) => ({
  id: data.id || `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  text: data.text || '',
  author: data.author || '',
  createdAt: data.createdAt || now(),
})

export const createPhoto = (data = {}) => ({
  id: data.id || `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  globalId: data.globalId || '',
  imageData: data.imageData || null,
  caption: data.caption || '',
  createdAt: data.createdAt || now(),
  createdBy: data.createdBy || '',
})

export const createDocument = (data = {}) => ({
  id: data.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  globalId: data.globalId || '',
  name: data.name || '',
  url: data.url || '',
  type: data.type || '',
  createdAt: data.createdAt || now(),
  createdBy: data.createdBy || '',
})

export const createHistoryEntry = (data = {}) => ({
  id: data.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  globalId: data.globalId || '',
  action: data.action || '',
  description: data.description || '',
  author: data.author || '',
  createdAt: data.createdAt || now(),
})

export const createAnalyticalSnapshot = (data = {}) => ({
  id: data.id || `asnap-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  globalId: data.globalId || '',
  progress: data.progress ?? 0,
  progressGroupId: data.progressGroupId || '',
  comment: data.comment || '',
  createdAt: data.createdAt || now(),
  createdBy: data.createdBy || '',
})

export const CLASSIFICATION_SPECIALTIES = [
  'Arquitectura',
  'Estructura',
  'MEP',
  'Calculo',
  'Electricidad',
  'Sanitario',
  'Climatización',
  'Coordinación',
  'Obra',
  'General',
]

export const CLASSIFICATION_DISCIPLINES = [
  'Arquitectura',
  'Ingeniería Civil',
  'Ingeniería Mecánica',
  'Ingeniería Eléctrica',
  'Ingeniería Sanitaria',
  'Ingeniería Estructural',
  'Coordinación BIM',
  'General',
]

export const ISSUE_TYPES = [
  'Información',
  'Coordinación',
  'Interferencia',
  'Error',
  'Calidad',
  'Seguridad',
  'General',
]

export const ISSUE_STATUSES = [
  'Abierta',
  'Pendiente',
  'En progreso',
  'En revisión',
  'Resuelta',
  'Cerrada',
]

export const ISSUE_PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica']

export const HISTORY_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  STATUS_CHANGED: 'status_changed',
  COMMENT_ADDED: 'comment_added',
  PHOTO_ADDED: 'photo_added',
  DOCUMENT_ADDED: 'document_added',
  ELEMENT_MAPPED: 'element_mapped',
  ELEMENT_UNMAPPED: 'element_unmapped',
  IFC_VERSION_CHANGED: 'ifc_version_changed',
  MARKED_OBSOLETE: 'marked_obsolete',
}

export const validateMetadata = (metadata) => {
  if (!metadata || !metadata.globalId) {
    return { valid: false, error: 'globalId es requerido' }
  }
  return { valid: true, error: null }
}
