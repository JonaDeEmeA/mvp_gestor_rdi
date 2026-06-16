import { round2, DEFAULT_WEIGHT } from '../constants/progressStandards';

export const calculateWeightedProgress = (groups) => {
  if (!groups || groups.length === 0) return 0;
  const totalWeight = groups.reduce((sum, g) => sum + (g.weight ?? DEFAULT_WEIGHT), 0);
  if (totalWeight === 0) return 0;
  const weighted = groups.reduce(
    (sum, g) => sum + (g.progress ?? 0) * (g.weight ?? DEFAULT_WEIGHT),
    0
  );
  return round2(weighted / totalWeight);
};

export const calculateCompliance = (realProgress, plannedProgress) => {
  if (!plannedProgress || plannedProgress <= 0) return realProgress > 0 ? 100 : 0;
  return round2((realProgress / plannedProgress) * 100);
};

export const calculateChildrenProgress = (groups, parentId) => {
  const children = (groups || []).filter((g) => g.parentId === parentId);
  if (children.length === 0) return null;
  const progress = calculateWeightedProgress(children);
  const totalWeight = children.reduce((sum, g) => sum + (g.weight ?? DEFAULT_WEIGHT), 0);
  const totalPlanned = children.reduce((sum, g) => sum + (g.plannedProgress ?? 0), 0);
  return { progress, totalWeight, totalPlanned, childCount: children.length };
};

export const buildGroupTree = (groups) => {
  if (!groups) return [];
  const map = new Map();
  const roots = [];

  for (const group of groups) {
    map.set(group.id, { ...group, children: [] });
  }

  for (const group of groups) {
    const node = map.get(group.id);
    if (group.parentId && map.has(group.parentId)) {
      map.get(group.parentId).children.push(node);
    } else if (!group.parentId) {
      roots.push(node);
    }
  }

  const propagateProgress = (nodes) => {
    for (const node of nodes) {
      if (node.children.length > 0) {
        propagateProgress(node.children);
        const calc = calculateChildrenProgress(groups, node.id);
        if (calc) {
          node.progress = calc.progress;
          node.weight = calc.totalWeight;
        }
      }
    }
  };

  propagateProgress(roots);
  return roots;
};

export const calculateProjectKPIs = (groups) => {
  if (!groups || groups.length === 0) {
    return {
      totalGroups: 0,
      totalElements: 0,
      weightedProgress: 0,
      simpleAverage: 0,
      compliance: 0,
      criticalCount: 0,
      coveredGroups: 0,
      rangeCounts: { '0': 0, '1-49': 0, '50-99': 0, '100': 0 },
    };
  }

  const rangeCounts = { '0': 0, '1-49': 0, '50-99': 0, '100': 0 };
  let totalPlanned = 0;

  for (const group of groups) {
    totalPlanned += group.plannedProgress ?? 0;

    const p = group.progress ?? 0;
    if (p === 0) rangeCounts['0']++;
    else if (p < 50) rangeCounts['1-49']++;
    else if (p < 100) rangeCounts['50-99']++;
    else rangeCounts['100']++;
  }

  const weightedProgress = calculateWeightedProgress(groups);
  const simpleAverage = groups.length > 0
    ? round2(groups.reduce((s, g) => s + (g.progress ?? 0), 0) / groups.length)
    : 0;
  const avgPlanned = groups.length > 0 ? round2(totalPlanned / groups.length) : 0;
  const compliance = calculateCompliance(weightedProgress, avgPlanned);
  const coveredGroups = groups.filter((g) => (g.progress ?? 0) > 0).length;
  const criticalCount = groups.filter((g) => g.isCritical).length;

  return {
    totalGroups: groups.length,
    totalElements: 0,
    weightedProgress,
    simpleAverage,
    compliance,
    criticalCount,
    coveredGroups,
    rangeCounts,
  };
};
