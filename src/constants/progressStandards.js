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

export const getProgressColor = (progress) => {
  for (const range of PROGRESS_RANGES) {
    if (progress >= range.min && progress <= range.max) {
      return range.color;
    }
  }
  return PROGRESS_COLORS.empty;
};
