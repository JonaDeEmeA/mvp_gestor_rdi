import { useEffect, useCallback } from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

/**
 * Extrae el valor legible de una propiedad IFC.
 */
const getPropertyValue = (property) => {
  if (property === null || property === undefined) return '';
  if (typeof property !== 'object') return String(property);
  if (property.value !== undefined) return String(property.value);
  // Soporte para IfcPropertySingleValue (NominalValue)
  if (property.NominalValue && property.NominalValue.value !== undefined) {
    return String(property.NominalValue.value);
  }
  return 'Complejo';
};

/**
 * Hook para manejar la selección de elementos y la obtención de sus propiedades.
 */
export const usePropertySelection = (components, world, highlighter, setSelectedEntityProps) => {

  const handleSelection = useCallback(async (modelIdMap) => {
    if (!components || !modelIdMap || Object.keys(modelIdMap).length === 0) {
      setSelectedEntityProps(null);
      return;
    }

    const fragments = components.get(OBC.FragmentsManager);

    try {
      const modelId = Object.keys(modelIdMap)[0];
      const expressIDs = [...modelIdMap[modelId]];
      const expressID = expressIDs[0];
      const model = fragments.list.get(modelId);
      if (!model) return;

      // Atributos y Property Sets
      let attributes = null;
      let psets = [];
      try {
        const itemsData = await model.getItemsData([Number(expressID)], {
          relations: {
            IsDefinedBy: { attributes: true, relations: true },
            HasPropertySets: { attributes: true, relations: true },
            IsTypedBy: { attributes: true, relations: false },
          },
        });

        if (itemsData && itemsData.length > 0) {
          attributes = itemsData[0];
          
          // Extraer property sets
          if (Array.isArray(attributes.IsDefinedBy)) {
            for (const pset of attributes.IsDefinedBy) {
              if (pset.Name && "value" in pset.Name && Array.isArray(pset.HasProperties)) {
                const properties = pset.HasProperties.map(prop => ({
                  name: prop.Name?.value || '',
                  value: getPropertyValue(prop)
                }));
                psets.push({
                  name: pset.Name.value,
                  properties: properties
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('[usePropertySelection] Error en getItemsData:', err);
      }
      
      if (!attributes) {
        attributes = { Name: { value: `Elemento ${expressID}` }, type: { value: "IFC Element" }, expressID };
      }

      setSelectedEntityProps({
        attributes: attributes,
        psets: psets,
        modelName: model.name || modelId
      });

    } catch (error) {
      console.error('[usePropertySelection] Error:', error);
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
    if (!components || !world || !highlighter) return;
    if (!world.renderer) return;

    try {
      const raycasters = components.get(OBC.Raycasters);
      const caster = raycasters.get(world);
      const result = await caster.castRay();

      if (result) {
        console.log('[usePropertySelection] Raycast exitoso:', result.localId);
        const modelIdMap = { [result.fragments.modelId]: new Set([result.localId]) };
        await highlighter.highlightByID("select", modelIdMap);

        // Ejecución directa de la selección para asegurar actualización de UI inmediata
        handleSelection(modelIdMap);
      } else {
        highlighter.clear("select");
        setSelectedEntityProps(null);
      }
    } catch (error) {
      console.error('[usePropertySelection] Error en pickEntity:', error);
    }
  }, [components, world, highlighter, setSelectedEntityProps]);

  return { pickEntity };
};
