import { useEffect, useCallback } from 'react';
import * as OBC from "@thatopen/components";

/**
 * Hook para manejar la selección de elementos y la obtención de sus propiedades.
 * @param {Object} components - Instancia de Components de ThatOpen.
 * @param {Object} world - Instancia del mundo actual.
 * @param {Object} highlighter - Instancia del Highlighter.
 * @param {Function} setSelectedEntityProps - Función para actualizar las propiedades en el estado global.
 */
export const usePropertySelection = (components, world, highlighter, setSelectedEntityProps) => {

  const handleSelection = useCallback(async (modelIdMap) => {
    console.log('--- Elemento Resaltado ---', modelIdMap);

    if (!components) return;
    const fragments = components.get(OBC.FragmentsManager);

    const promises = [];
    for (const [modelId, localIds] of Object.entries(modelIdMap)) {
      const model = fragments.list.get(modelId);
      if (!model) continue;

      // localIds es un Set, lo convertimos a array
      promises.push(model.getItemsData([...localIds]));
    }

    try {
      const propertiesData = await Promise.all(promises);
      console.log('Propiedades recuperadas:', propertiesData);

      // Aplanamos los resultados y tomamos el primero (asumiendo selección única por ahora)
      if (propertiesData.length > 0 && propertiesData[0].length > 0) {
        setSelectedEntityProps(propertiesData[0][0]);
      } else {
        setSelectedEntityProps(null);
      }
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      setSelectedEntityProps(null);
    }
  }, [components, setSelectedEntityProps]);

  // Suscribirse al evento de resaltado
  useEffect(() => {
    if (!highlighter) return;

    const onSelectionHandler = (modelIdMap) => {
      handleSelection(modelIdMap);
    };

    highlighter.events.select.onHighlight.add(onSelectionHandler);

    return () => {
      highlighter.events.select.onHighlight.remove(onSelectionHandler);
    };
  }, [highlighter, handleSelection]);

  // Función para ejecutar el raycast al hacer clic
  const pickEntity = useCallback(async () => {
    if (!components || !world || !highlighter) {
      console.warn('[usePropertySelection] Faltan dependencias:', { components: !!components, world: !!world, highlighter: !!highlighter });
      return;
    }

    // Verificar si el mundo tiene un renderizador (necesario para el raycaster)
    if (!world.renderer) {
      console.warn('[usePropertySelection] El mundo aún no tiene un renderizador configurado.');
      return;
    }

    try {
      const raycasters = components.get(OBC.Raycasters);
      const caster = raycasters.get(world);
      
      console.log('[usePropertySelection] Ejecutando castRay...');
      const result = await caster.castRay();
      
      if (result) {
        console.log('[usePropertySelection] Elemento detectado:', result);
        
        // Crear el modelIdMap para el resaltado
        const modelIdMap = { [result.fragments.modelId]: new Set([result.localId]) };
        
        // Usamos el ID de selección por defecto "select" o el que configuró el usuario
        await highlighter.highlightByID("select", modelIdMap);

        // Obtener y actualizar propiedades
        const fragments = components.get(OBC.FragmentsManager);
        const model = fragments.list.get(result.fragments.modelId);
        if (model) {
          const propertiesData = await model.getItemsData([result.localId]);
          if (propertiesData && propertiesData.length > 0) {
            setSelectedEntityProps(propertiesData[0]);
          }
        }
      } else {
        // Si no hay resultado, limpiamos la selección
        highlighter.clear("select");
        setSelectedEntityProps(null);
      }
    } catch (error) {
      console.error('[usePropertySelection] Error durante la selección:', error);
    }
  }, [components, world, highlighter, setSelectedEntityProps]);

  return { pickEntity };
};
