import { useState } from 'react';
import { useAuth } from './useAuth';
import { useAnalytics } from './useAnalytics';


const initialFormData = {
  type: "General",
  title: "",
  description: "",
  status: "Abierta",
  label: "General",
  assignedTo: "",
  dueDate: null, 
  comments: [],  
};

export const useRDIForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { trackRDIAction } = useAnalytics();


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
    const requiredFields = ['type', 'title', 'dueDate', 'status'];
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
      description: formData.description?.trim() || "",
      assignedTo: formData.assignedTo || "",
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
      type: item.type || item.tipo || "General",
      title: item.title || item.titulo || "",
      description: item.description || item.descripcion || item.comentario || "",
      status: item.status || item.estado || "Abierta",
      label: item.label || item.etiqueta || "General",
      assignedTo: item.assignedTo || item.assigned_to || "",
      dueDate: item.dueDate ? (item.dueDate instanceof Date ? item.dueDate : new Date(item.dueDate)) : null,
      comments: item.comments || []
    });
    setEditId(item.id);
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
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      label: formData.label,
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
        trackRDIAction('update', editId);
      } else {
        // Crear nuevo
        console.log('Creando nuevo RDI:', preparedData);
        const result = await onSave(preparedData);
        trackRDIAction('create', result?.id || 'new');
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