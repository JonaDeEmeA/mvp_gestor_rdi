import { useState, useEffect, useRef } from 'react';
import { GraphicVertexPicker } from '@thatopen/components-front';
import * as FRAGS from '@thatopen/fragments';

export const useVertexPicker = (component, world) => {
  const [pickedPoint, setPickedPoint] = useState(null);
  const vertexPickerRef = useRef(null);

  useEffect(() => {
    if (!component || !world) return;

    const vertexPicker = new GraphicVertexPicker(component);
    vertexPicker.world = world;
    vertexPickerRef.current = vertexPicker;

    return () => {
      vertexPicker.dispose();
    };
  }, [component, world]);

  const pickVertex = async () => {
    console.log('--- Intentando capturar coordenada ---');
    if (!vertexPickerRef.current) {
      console.error('VertexPicker no inicializado');
      return null;
    }

    try {
      // Asegurar que el mundo esté vinculado
      if (!vertexPickerRef.current.world && world) {
        console.log('Vinculando mundo al VertexPicker...');
        vertexPickerRef.current.world = world;
      }

      console.log('Llamando a vertexPicker.get()...');
      const result = await vertexPickerRef.current.get({
        snappingClasses: [
          FRAGS.SnappingClass.FACE,
          FRAGS.SnappingClass.POINT,
          FRAGS.SnappingClass.LINE
        ]
      });

      if (result && result.point) {
        console.log('Coordenada capturada:', result.point);
        setPickedPoint(result.point);
        return result.point;
      } else {
        console.warn('No se detectó ningún punto bajo el cursor');
      }
    } catch (error) {
      console.error('Error en pickVertex:', error);
    }
    return null;
  };

  return {
    pickedPoint,
    pickVertex,
    vertexPickerRef
  };
};