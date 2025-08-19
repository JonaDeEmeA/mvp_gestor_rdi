import { useState } from 'react';

const initialFormData = {
  tipo: "",
  titulo: "",
  descripcion: "",
  comentario: "",
  fecha: null,
  estado: "",
  etiqueta: "",
};

export const useRDIForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    console.log(formData);
    
  };

  // Validar formulario
  const validateForm = () => {
    const requiredFields = ['tipo', 'titulo', 'fecha', 'estado'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      console.warn('Campos requeridos faltantes:', missingFields);
      return false;
    }
    
    return true;
  };

  // Preparar datos para guardar
  const prepareFormDataForSave = () => {
    return {
      ...formData,
      fecha: formData.fecha ? formData.fecha.toLocaleDateString("es-ES") : null,
      // Limpiar campos vacíos
      descripcion: formData.descripcion?.trim() || "",
      comentario: formData.comentario?.trim() || "",
    };
  };

  // Iniciar nuevo formulario
  const startNewForm = () => {
    setShowForm(true);
    setEditId(null);
    setFormData(initialFormData);
    setIsSubmitting(false);
  };

  // Iniciar edición
  const startEdit = (item) => {
    setFormData({
      tipo: item.tipo  || "",
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      comentario: item.comentario || "",
      fecha: parseDateFromString(item.fecha),
      estado: item.estado  || "",
      etiqueta: item.etiqueta  || "",
    });
    setEditId(item.id);
    setShowForm(true);
    setIsSubmitting(false);
  };

  // Cancelar formulario
  const cancelForm = () => {
    setFormData(initialFormData);
    setEditId(null);
    setShowForm(false);
    setIsSubmitting(false);
  };

  // Resetear formulario después de guardar
  const resetForm = () => {
    setFormData(initialFormData);
    setEditId(null);
    setShowForm(false);
    setIsSubmitting(false);
  };

  // Helper para convertir "dd/mm/yyyy" a Date
  const parseDateFromString = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      const [day, month, year] = dateStr.split("/");
      return new Date(Number(year), Number(month) - 1, Number(day));
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error);
      return null;
    }
  };

  // Obtener datos del formulario para BCF
  const getBCFTopicData = () => {
    return {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha: formData.fecha,
      types: formData.tipo,
      statuses: formData.estado,
      labels: formData.etiqueta,
    };
  };

  // Manejar envío del formulario
  const handleSubmit = async (onSave, onUpdate) => {
    if (!validateForm()) {
      console.warn('Formulario inválido');
      return false;
    }

    setIsSubmitting(true);

    try {
      const preparedData = prepareFormDataForSave();
      
      if (editId !== null) {
        // Actualizar existente
        console.log('Actualizando RDI:', editId, preparedData);
        await onUpdate(editId, preparedData);
      } else {
        // Crear nuevo
        console.log('Creando nuevo RDI:', preparedData);
        await onSave(preparedData);
      }

      resetForm();
      return true;
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    // Estado del formulario
    formData,
    showForm,
    editId,
    isSubmitting,
    
    // Acciones del formulario
    handleFormChange,
    validateForm,
    prepareFormDataForSave,
    startNewForm,
    startEdit,
    cancelForm,
    resetForm,
    handleSubmit,
    
    // Utilidades
    getBCFTopicData,
    isEditing: editId !== null,
  };
};