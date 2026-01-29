// src/components/Dashboard/CreateProjectDialog.jsx

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

export default function CreateProjectDialog({ isOpen, onClose, onCreate }) {
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ✅ PASO 1: Crear proyecto
  const handleCreate = async () => {
    console.log('➕ PASO 1: Creando nuevo proyecto:', projectName);
    setError('');
    
    if (!projectName.trim()) {
      setError('El nombre del proyecto es requerido');
      console.warn('⚠️ Nombre de proyecto vacío');
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate(projectName.trim());
      console.log('✅ PASO 1 COMPLETADO: Proyecto creado');
      handleClose();
    } catch (err) {
      console.error('❌ Error creando proyecto:', err);
      setError('Error al crear proyecto: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚪 Cerrar modal
  const handleClose = () => {
    if (isSubmitting) return;
    console.log('🚪 Cerrando modal de creación');
    setProjectName('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
      
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
          placeholder="Ej: Proyecto ABC"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isSubmitting}
          required
          onKeyDown={(e) => {
            if (e.key === 'Enter' && projectName.trim() && !isSubmitting) {
              handleCreate();
            }
          }}
          helperText="Ingresa un nombre descriptivo para tu proyecto"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleCreate}
          variant="contained"
          disabled={!projectName.trim() || isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={20} /> : 'Crear Proyecto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

console.log('✅ CreateProjectDialog creado con Material UI');