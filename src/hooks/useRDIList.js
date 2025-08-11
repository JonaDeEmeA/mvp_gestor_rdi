import { useState } from 'react';

export const useRDIList = () => {
  const [rdiList, setRdiList] = useState([]);
  const [filterTipo, setFilterTipo] = useState("");

  // Agregar nuevo RDI a la lista
  const addRDI = (rdiData) => {
    const newRDI = {
      ...rdiData,
      id: rdiData.id || Date.now(),
    };
    setRdiList((prev) => [...prev, newRDI]);
    return newRDI;
  };

  // Actualizar RDI existente
  const updateRDI = (id, updatedData) => {
    setRdiList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updatedData }
          : item
      )
    );
  };

  // Eliminar RDI
  const removeRDI = (id) => {
    setRdiList((prev) => prev.filter((item) => item.id !== id));
  };

  // Obtener RDI por ID
  const getRDIById = (id) => {
    return rdiList.find((item) => item.id === id);
  };

  // Filtrar lista según el filtro seleccionado
  const getFilteredRDIList = () => {
    return filterTipo
      ? rdiList.filter((rdi) => rdi.types === filterTipo)
      : rdiList;
  };

  // Actualizar estado de un RDI específico
  const updateRDIStatus = (id, newStatus) => {
    setRdiList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, statuses: newStatus }
          : item
      )
    );
  };

  // Guardar o actualizar RDI
  const saveRDI = (formData, editId = null) => {
    const rdiData = {
      ...formData,
      fecha: formData.fecha.toLocaleDateString("es-ES"),
    };

    if (editId !== null) {
      // Actualizar existente
      updateRDI(editId, rdiData);
      return { ...rdiData, id: editId };
    } else {
      // Crear nuevo
      return addRDI(rdiData);
    }
  };

  // Limpiar toda la lista
  const clearRDIList = () => {
    setRdiList([]);
  };

  // Obtener estadísticas de la lista
  const getRDIStats = () => {
    const total = rdiList.length;
    const byStatus = rdiList.reduce((acc, rdi) => {
      const status = rdi.statuses || 'Sin estado';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const byType = rdiList.reduce((acc, rdi) => {
      const type = rdi.types || 'Sin tipo';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      byStatus,
      byType,
    };
  };

  return {
    rdiList,
    filterTipo,
    setFilterTipo,
    addRDI,
    updateRDI,
    removeRDI,
    getRDIById,
    getFilteredRDIList,
    updateRDIStatus,
    saveRDI,
    clearRDIList,
    getRDIStats,
  };
};