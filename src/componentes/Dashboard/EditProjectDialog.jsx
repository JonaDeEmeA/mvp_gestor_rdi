// src/components/Dashboard/EditProjectDialog.jsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

export default function EditProjectDialog({ 
  project, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}) {
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ✅ PASO 1: Cargar datos del proyecto al abrir
  useEffect(() => {
    if (project) {
      console.log('📂 PASO 1: Cargando datos del proyecto:', project.name);
      setProjectName(project.name);
      setError('');
    }
  }, [project]);

  // 💾 PASO 2: Guardar cambios
  const handleSave = async () => {
    console.log('💾 PASO 2: Guardando cambios...');
    setError('');
    
    if (!projectName.trim()) {
      setError('El nombre del proyecto es requerido');
      console.warn('⚠️ Nombre de proyecto vacío');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(project.id, { name: projectName.trim() });
      console.log('✅ PASO 2 COMPLETADO: Cambios guardados');
      handleClose();
    } catch (err) {
      console.error('❌ Error guardando cambios:', err);
      setError('Error al guardar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🗑️ PASO 3: Eliminar proyecto
  const handleDelete = async () => {
    console.log('🗑️ PASO 3: Solicitando confirmación de eliminación');
    
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el proyecto "${project.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onDelete(project.id);
      console.log('✅ PASO 3 COMPLETADO: Proyecto eliminado');
      handleClose();
    } catch (err) {
      console.error('❌ Error eliminando proyecto:', err);
      setError('Error al eliminar: ' + err.message);
      setIsSubmitting(false);
    }
  };

  // 🚪 Cerrar modal
  const handleClose = () => {
    if (isSubmitting) return;
    console.log('🚪 Cerrando modal de edición');
    setProjectName('');
    setError('');
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Editar Proyecto</DialogTitle>
      
      <DialogContent>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Input Nombre */}
        <TextField
          autoFocus
          margin="dense"
          label="Nombre del Proyecto"
          type="text"
          fullWidth
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isSubmitting}
          required
          onKeyDown={(e) => {
            if (e.key === 'Enter' && projectName.trim() && !isSubmitting) {
              handleSave();
            }
          }}
        />

        {/* Información del Proyecto */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>ID:</strong> {project.id}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>Creado:</strong> {new Date(project.createdAt).toLocaleString('es-ES')}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Usuario:</strong> {project.userEmail}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        {/* Botón Eliminar - Izquierda */}
        <Button 
          onClick={handleDelete}
          disabled={isSubmitting}
          color="error"
          variant="outlined"
          startIcon={isSubmitting ? null : '🗑️'}
        >
          {isSubmitting ? <CircularProgress size={20} /> : 'Eliminar'}
        </Button>

        {/* Botones Cancelar y Guardar - Derecha */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!projectName.trim() || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

console.log('✅ EditProjectDialog creado con Material UI');