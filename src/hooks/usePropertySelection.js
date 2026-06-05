import { useState, useEffect, useCallback } from 'react';
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { getGuidMap } from '../services/guidMapService';

const getPropertyValue = (property) => {
  if (property === null || property === undefined) return '';
  if (typeof property !== 'object') return String(property);
  if (property.value !== undefined) return String(property.value);
  if (property.NominalValue && property.NominalValue.value !== undefined) {
    return String(property.NominalValue.value);
  }
  return 'Complejo';
};

export const usePropertySelection = (components, world, highlighter, setSelectedEntityProps) => {
  const [selectedGuid, setSelectedGuid] = useState(null);

  const handleSelection = useCallback(async (modelIdMap) => {
    if (!components || !modelIdMap || Object.keys(modelIdMap).length === 0) {
      setSelectedEntityProps(null);
      setSelectedGuid(null);
      return;
    }

    const fragments = components.get(OBC.FragmentsManager);

    try {
      const modelId = Object.keys(modelIdMap)[0];
      const expressIDs = [...modelIdMap[modelId]];
      const expressID = expressIDs[0];
      const model = fragments.list.get(modelId);
      if (!model) return;

      let attributes = null;
      let psets = [];
      let globalId = null;

      try {
        const guids = await fragments.modelIdMapToGuids(modelIdMap);
        globalId = (guids && guids.length > 0) ? guids[0] : null;
      } catch (err) {
        console.warn('[usePropertySelection] Error en modelIdMapToGuids:', err);
      }

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

      if (!globalId) {
        console.warn(
          '[usePropertySelection] No se pudo extraer GlobalId.',
          'ExpressID:', expressID,
          'ModelId:', modelId,
          '¿El modelo se cargó con IfcLoader usando addAllAttributes?'
        );
      }

      setSelectedGuid(globalId);

      if (globalId) {
        getGuidMap().addMapping(globalId, modelId, Number(expressID));
      }

      setSelectedEntityProps({
        attributes: attributes,
        psets: psets,
        modelName: model.name || modelId,
        globalId: globalId,
      });

    } catch (error) {
      console.error('[usePropertySelection] Error:', error);
      setSelectedEntityProps(null);
      setSelectedGuid(null);
    }
  }, [components, setSelectedEntityProps]);

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

        handleSelection(modelIdMap);
      } else {
        highlighter.clear("select");
        setSelectedEntityProps(null);
        setSelectedGuid(null);
      }
    } catch (error) {
      console.error('[usePropertySelection] Error en pickEntity:', error);
    }
  }, [components, world, highlighter, setSelectedEntityProps]);

  return { pickEntity, selectedGuid };
};
