import { useState, useCallback, useRef } from 'react';
import { generateFloorPlanImage } from '../services/floorPlanService';
import { VIEWER_CONFIG } from '../constants/viewerConfig';

export const useFloorPlan = (worldRef) => {
  const [show, setShow] = useState(false);
  const [level, setLevel] = useState(VIEWER_CONFIG.FLOOR_PLAN.defaultLevel);
  const [imageUrl, setImageUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const generatingRef = useRef(false);

  const toggle = useCallback(() => {
    setShow(prev => !prev);
    if (show) {
      setImageUrl(null);
      setError(null);
    }
  }, [show]);

  const handleLevelChange = useCallback((newLevel) => {
    setLevel(newLevel);
    setImageUrl(null);
    setError(null);
  }, []);

  const generate = useCallback(async () => {
    const world = worldRef.current;
    if (!world || generatingRef.current) return;

    generatingRef.current = true;
    setGenerating(true);
    setError(null);

    try {
      const url = await generateFloorPlanImage(
        world,
        level,
        VIEWER_CONFIG.FLOOR_PLAN.imageWidth,
        VIEWER_CONFIG.FLOOR_PLAN.imageHeight
      );
      setImageUrl(url);
    } catch (err) {
      console.error('Error generating floor plan:', err);
      setError(err.message || 'Error al generar el plano');
    } finally {
      setGenerating(false);
      generatingRef.current = false;
    }
  }, [worldRef, level]);

  const exportImage = useCallback(() => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `planta_nivel_${level.toFixed(1)}m.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl, level]);

  const reset = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setShow(false);
    setLevel(VIEWER_CONFIG.FLOOR_PLAN.defaultLevel);
    setImageUrl(null);
    setError(null);
  }, [imageUrl]);

  return {
    show,
    level,
    imageUrl,
    generating,
    error,
    toggle,
    setLevel: handleLevelChange,
    generate,
    exportImage,
    reset,
  };
};
