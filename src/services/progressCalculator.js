import { round2, DEFAULT_WEIGHT } from '../constants/progressStandards';

export const interpolatePlannedProgress = (curve, targetDate) => {
  if (!curve || curve.length === 0) return null;
  const sorted = [...curve]
    .filter((p) => p.date && p.planned != null)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length === 0) return null;
  const target = new Date(targetDate || Date.now()).getTime();
  if (target <= new Date(sorted[0].date).getTime()) return sorted[0].planned;
  if (target >= new Date(sorted[sorted.length - 1].date).getTime()) return sorted[sorted.length - 1].planned;
  for (let i = 0; i < sorted.length - 1; i++) {
    const t1 = new Date(sorted[i].date).getTime();
    const t2 = new Date(sorted[i + 1].date).getTime();
    if (target >= t1 && target <= t2) {
      const ratio = (target - t1) / (t2 - t1);
      return round2(sorted[i].planned + ratio * (sorted[i + 1].planned - sorted[i].planned));
    }
  }
  return sorted[sorted.length - 1].planned;
};

export const getEffectivePlannedProgress = (group, targetDate) => {
  const curve = group.plannedCurve;
  if (curve && curve.length > 0) {
    const interpolated = interpolatePlannedProgress(curve, targetDate);
    if (interpolated != null) return interpolated;
  }
  return group.plannedProgress ?? 0;
};

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

export const calculateChildrenProgress = (groups, parentId, targetDate) => {
  const children = (groups || []).filter((g) => g.parentId === parentId);
  if (children.length === 0) return null;
  const progress = calculateWeightedProgress(children);
  const totalWeight = children.reduce((sum, g) => sum + (g.weight ?? DEFAULT_WEIGHT), 0);
  const totalPlanned = children.reduce((sum, g) => sum + (getEffectivePlannedProgress(g, targetDate) ?? 0), 0);
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
        const progress = calculateWeightedProgress(node.children);
        const totalWeight = node.children.reduce((sum, g) => sum + (g.weight ?? DEFAULT_WEIGHT), 0);
        node.progress = progress;
        node.weight = totalWeight;
      }
    }
  };

  propagateProgress(roots);
  return roots;
};

const getActualProgressAtDate = (groups, snapshotsByGroup, date) => {
  let totalWeight = 0;
  let weightedSum = 0;
  const dateStr = date.split('T')[0];
  for (const group of groups) {
    const weight = group.weight ?? DEFAULT_WEIGHT;
    totalWeight += weight;
    const snaps = (snapshotsByGroup[group.id] || [])
      .filter((s) => s.createdAt.split('T')[0] <= dateStr)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    weightedSum += (snaps.length > 0 ? snaps[0].progress : 0) * weight;
  }
  return totalWeight > 0 ? round2(weightedSum / totalWeight) : 0;
};

const getGroupActualAtDate = (group, snapshots, date) => {
  const dateStr = date.split('T')[0];
  const prior = (snapshots || [])
    .filter((s) => s.createdAt.split('T')[0] <= dateStr)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return prior.length > 0 ? prior[0].progress : 0;
};

export const buildCurveDatasets = (groups, snapshotsByGroup, selectedGroupId) => {
  const empty = { labels: [], plannedData: [], actualData: [], currentPlanned: 0, currentActual: 0, diffPercent: 0 };
  if (!groups || groups.length === 0) return empty;

  if (selectedGroupId) {
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return empty;
    const children = groups.filter((g) => g.parentId === selectedGroupId);
    const isParent = children.length > 0;

    if (isParent) {
      const childGroups = children;
      const childSnapshotDates = childGroups.flatMap(
        (c) => (snapshotsByGroup[c.id] || []).map((s) => s.createdAt.split('T')[0])
      );
      const curveDates = (group.plannedCurve || []).map((p) => p.date).filter(Boolean);
      const allDates = [...new Set([...curveDates, ...childSnapshotDates])].sort((a, b) => new Date(a) - new Date(b));
      if (allDates.length === 0) return empty;

      const plannedData = allDates.map((d) => interpolatePlannedProgress(group.plannedCurve, d) ?? group.plannedProgress ?? 0);
      const actualData = allDates.map((d) => getActualProgressAtDate(childGroups, snapshotsByGroup, d));

      return {
        labels: allDates,
        plannedData,
        actualData,
        currentPlanned: plannedData[plannedData.length - 1],
        currentActual: actualData[actualData.length - 1],
        diffPercent: round2(actualData[actualData.length - 1] - plannedData[plannedData.length - 1]),
      };
    }

    const snapshots = snapshotsByGroup[selectedGroupId] || [];
    const snapshotDates = snapshots.map((s) => s.createdAt.split('T')[0]);
    const curveDates = (group.plannedCurve || []).map((p) => p.date).filter(Boolean);
    const allDates = [...new Set([...curveDates, ...snapshotDates])].sort((a, b) => new Date(a) - new Date(b));
    if (allDates.length === 0) return empty;

    const plannedData = allDates.map((d) => interpolatePlannedProgress(group.plannedCurve, d) ?? group.plannedProgress ?? 0);
    const actualData = allDates.map((d) => getGroupActualAtDate(group, snapshots, d));

    return {
      labels: allDates,
      plannedData,
      actualData,
      currentPlanned: plannedData[plannedData.length - 1],
      currentActual: actualData[actualData.length - 1],
      diffPercent: round2(actualData[actualData.length - 1] - plannedData[plannedData.length - 1]),
    };
  }

  const allDates = [...new Set(
    groups.flatMap((g) => [
      ...(g.plannedCurve || []).map((p) => p.date).filter(Boolean),
      ...(snapshotsByGroup[g.id] || []).map((s) => s.createdAt.split('T')[0]),
    ])
  )].sort((a, b) => new Date(a) - new Date(b));
  if (allDates.length === 0) return empty;

  const plannedData = allDates.map((d) => {
    let tw = 0, ws = 0;
    for (const g of groups) {
      const w = g.weight ?? DEFAULT_WEIGHT;
      tw += w;
      ws += (getEffectivePlannedProgress(g, d) ?? 0) * w;
    }
    return tw > 0 ? round2(ws / tw) : 0;
  });

  const actualData = allDates.map((d) => getActualProgressAtDate(groups, snapshotsByGroup, d));

  return {
    labels: allDates,
    plannedData,
    actualData,
    currentPlanned: plannedData[plannedData.length - 1],
    currentActual: actualData[actualData.length - 1],
    diffPercent: round2(actualData[actualData.length - 1] - plannedData[plannedData.length - 1]),
  };
};

export const calculateProjectKPIs = (groups, targetDate) => {
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
    const effPlanned = getEffectivePlannedProgress(group, targetDate);
    totalPlanned += effPlanned;

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
