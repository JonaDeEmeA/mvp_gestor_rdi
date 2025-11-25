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
    if (!vertexPickerRef.current) return null;  
  
    try {  
      const result = await vertexPickerRef.current.get({  
        snappingClasses: [  
          FRAGS.SnappingClass.FACE,  
          FRAGS.SnappingClass.POINT,  
          FRAGS.SnappingClass.LINE  
        ]  
      });  
  
      if (result && result.point) {  
        setPickedPoint(result.point);  
        return result.point;  
      }  
    } catch (error) {  
      console.error('Error picking vertex:', error);  
    }  
    return null;  
  };  
  
  return {  
    pickedPoint,  
    pickVertex,  
    vertexPickerRef  
  };  
};