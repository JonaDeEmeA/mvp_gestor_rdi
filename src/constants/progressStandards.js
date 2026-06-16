export const PROGRESS_COLORS = {
  empty: '#888888',
  partial: '#FFC107',
  advanced: '#2196F3',
  completed: '#4CAF50',
};

export const PROGRESS_RANGES = [
  { min: 0, max: 0, color: PROGRESS_COLORS.empty, label: 'Sin avance' },
  { min: 1, max: 49, color: PROGRESS_COLORS.partial, label: 'En proceso' },
  { min: 50, max: 99, color: PROGRESS_COLORS.advanced, label: 'Avanzado' },
  { min: 100, max: 100, color: PROGRESS_COLORS.completed, label: 'Completado' },
];

export const PROGRESS_LIMITS = {
  maxPhotosPerSnapshot: 5,
  maxImageWidth: 1200,
  snapshotCommentMaxLength: 500,
  groupNameMaxLength: 100,
};

export const WEIGHT_UNITS = [
  { value: 'porcentaje', label: 'Porcentaje' },
  { value: 'costo', label: 'Costo' },
  { value: 'horasHombre', label: 'Horas Hombre' },
  { value: 'volumen', label: 'Volumen' },
  { value: 'personalizado', label: 'Personalizado' },
];

export const DEFAULT_WEIGHT = 1.0;
export const DECIMAL_PLACES = 2;

export const round2 = (value) => Math.round(value * 100) / 100;

export const getWeightUnitLabel = (unit) => {
  const found = WEIGHT_UNITS.find(u => u.value === unit);
  return found ? found.label : unit;
};

const WEIGHT_PREFIXES = {
  porcentaje: { prefix: '', suffix: '', decimals: 1 },
  costo: { prefix: '$', suffix: '', decimals: 0 },
  horasHombre: { prefix: '', suffix: ' hrs', decimals: 1 },
  volumen: { prefix: '', suffix: ' m³', decimals: 1 },
  personalizado: { prefix: '', suffix: ' ud', decimals: 2 },
};

export const formatWeight = (weight, unit) => {
  const cfg = WEIGHT_PREFIXES[unit] || WEIGHT_PREFIXES.porcentaje;
  const formatted = Number(weight).toFixed(cfg.decimals);
  return `${cfg.prefix}${formatted}${cfg.suffix}`;
};

export const WEIGHT_HELPERS = {
  porcentaje: 'Peso relativo. 1.0 = peso estándar, 3.0 = triple de importancia.',
  costo: 'Monto en dólares que representa este grupo en el presupuesto.',
  horasHombre: 'Horas hombre estimadas para completar este grupo.',
  volumen: 'Volumen en metros cúbicos que representa este grupo.',
  personalizado: 'Valor personalizado. Define tu propia escala de peso.',
};

export const getProgressColor = (progress) => {
  for (const range of PROGRESS_RANGES) {
    if (progress >= range.min && progress <= range.max) {
      return range.color;
    }
  }
  return PROGRESS_COLORS.empty;
};
