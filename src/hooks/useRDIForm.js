import { useState } from 'react';
import { useAuth } from './useAuth';

const initialFormData = {
  tipo: "",
  titulo: "",
  descripcion: "",
  comentario: "",
  estado: "",
  etiqueta: "",
  assignedTo: "",
  dueDate: null, // Fecha Límite (Estándar BCF)
  fecha: null,   // Mantener por compatibilidad legacy
  comments: [],  // Historial de comentarios BCF
};

export const useRDIForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    console.log(formData);

  };

  // Agregar un nuevo comentario al historial
  const handleAddComment = (commentText) => {
    if (!commentText?.trim()) return;

    const newCommentObj = {
      guid: `c-${Math.random().toString(36).substr(2, 9)}`,
      author: user?.email || 'signed.user@mail.com',
      date: new Date().toISOString(),
      comment: commentText.trim()
    };

    setFormData(prev => ({
      ...prev,
      comments: [newCommentObj, ...(prev.comments || [])]
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const requiredFields = ['tipo', 'titulo', 'dueDate', 'estado'];
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
    // Si dueDate está presente, sincronizarlo con fecha para compatibilidad con componentes que aún busquen .fecha
    const formattedDate = formData.dueDate ? formData.dueDate.toLocaleDateString("es-ES") : null;
    
    return {
      ...formData,
      dueDate: formattedDate,
      fecha: formattedDate || (formData.fecha ? formData.fecha.toLocaleDateString("es-ES") : null),
      assignedTo: formData.assignedTo || "",
      descripcion: formData.descripcion?.trim() || "",
      comentario: formData.comentario?.trim() || "",
      comments: formData.comments || [],
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
      tipo: item.tipo || "",
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      comentario: item.comentario || "",
      fecha: parseDateFromString(item.fecha),
      estado: item.estado || "",
      etiqueta: item.etiqueta || "",
      assignedTo: item.assignedTo || item.assigned_to || "",
      dueDate: parseDateFromString(item.dueDate),
      comments: item.comments || (item.comentario ? [{
        guid: `legacy-${item.id}`,
        author: item.creationAuthor || 'signed.user@mail.com',
        date: item.creationDate || new Date().toISOString(),
        comment: item.comentario
      }] : [])
    });
    setEditId(item.id);
    //setShowForm(true);
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
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
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
    handleAddComment,
    isEditing: editId !== null,
  };
};