import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { getProgressColor } from '../constants/progressStandards';

const STYLE_PREFIX = 'progress-';

const colorToThree = (hex) => new THREE.Color(hex);

export const useBIMColors = (fragmentsManager, highlighter) => {
  const appliedGroupsRef = useRef(new Set());

  const isStyleApplied = useCallback((groupId) => {
    return appliedGroupsRef.current.has(groupId);
  }, []);

  const applyGroupColor = useCallback(async (groupId, elements, progress) => {
    if (!highlighter || !fragmentsManager) return;
    if (!elements || elements.length === 0) return;

    const guids = elements.map((el) => el.ifcGuid);
    const styleName = `${STYLE_PREFIX}${groupId}`;

    try {
      const modelIdMap = await fragmentsManager.guidsToModelIdMap(guids);
      const hasItems = modelIdMap && Object.keys(modelIdMap).some(
        (mid) => modelIdMap[mid] && modelIdMap[mid].size > 0
      );

      if (hasItems) {
        const color = colorToThree(getProgressColor(progress));
        highlighter.styles.set(styleName, {
          color,
          opacity: 1,
          transparent: false,
          renderedFaces: 0,
        });
        await highlighter.highlightByID(styleName, modelIdMap);
        appliedGroupsRef.current.add(groupId);
      }
    } catch (err) {
      console.warn(`[useBIMColors] Error al aplicar color al grupo ${groupId}:`, err);
    }
  }, [fragmentsManager, highlighter]);

  const applyAllGroups = useCallback(async (groups, getElementsByGroup) => {
    if (!highlighter || !fragmentsManager || !groups) return;

    for (const group of groups) {
      try {
        const elements = await getElementsByGroup(group.id);
        if (elements.length > 0) {
          await applyGroupColor(group.id, elements, group.progress);
        }
      } catch (err) {
        console.warn(`[useBIMColors] Error en grupo ${group.id}:`, err);
      }
    }
  }, [fragmentsManager, highlighter, applyGroupColor]);

  const clearGroup = useCallback(async (groupId) => {
    if (!highlighter) return;
    if (!appliedGroupsRef.current.has(groupId)) return;

    const styleName = `${STYLE_PREFIX}${groupId}`;
    try {
      highlighter.clear(styleName);
      appliedGroupsRef.current.delete(groupId);
    } catch (err) {
      console.warn(`[useBIMColors] Error al limpiar grupo ${groupId}:`, err);
    }
  }, [highlighter]);

  const clearAll = useCallback(async () => {
    if (!highlighter) return;

    for (const groupId of appliedGroupsRef.current) {
      const styleName = `${STYLE_PREFIX}${groupId}`;
      try {
        highlighter.clear(styleName);
      } catch (err) {
        console.warn(`[useBIMColors] Error al limpiar grupo ${groupId}:`, err);
      }
    }
    appliedGroupsRef.current.clear();
  }, [highlighter]);

  return {
    applyGroupColor,
    applyAllGroups,
    clearGroup,
    clearAll,
  };
};

export default useBIMColors;
