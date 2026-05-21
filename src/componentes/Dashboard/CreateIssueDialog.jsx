import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, PhotoCamera } from '@mui/icons-material';
import { createIssue, updateIssue } from '../../utilitario/indexedDBManager';

const CreateIssueDialog = ({ isOpen, onClose, projectId, onCreated, onUpdated, initialType = 'Calidad', issueToEdit = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: initialType,
    status: 'Abierta',
    priority: 'Media',
    assignedTo: '',
    level: 'Nivel 1',
    plan: 'Plano A101',
    image: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar el formulario cuando cambie el issueToEdit o initialType
  React.useEffect(() => {
    if (isOpen) {
      if (issueToEdit) {
        setFormData({
          title: issueToEdit.title || issueToEdit.titulo || '',
          description: issueToEdit.description || issueToEdit.comentario || '',
          type: issueToEdit.type || issueToEdit.tipo || initialType,
          status: issueToEdit.status || issueToEdit.estado || 'Abierta',
          priority: issueToEdit.priority || issueToEdit.prioridad || 'Media',
          assignedTo: issueToEdit.assignedTo || issueToEdit.asignado_a || '',
          level: issueToEdit.level || '',
          plan: issueToEdit.plan || '',
          image: issueToEdit.image || null
        });
      } else if (initialType) {
        setFormData(prev => ({ ...prev, type: initialType }));
      }
    }
  }, [isOpen, initialType, issueToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    setIsSubmitting(true);
    try {
      if (issueToEdit) {
        const issueData = { ...formData, updatedAt: new Date().toISOString() };
        await updateIssue(issueToEdit.id, issueData);
        if (onUpdated) onUpdated({ ...issueToEdit, ...issueData });
        handleClose();
      } else {
        const issueData = {
          ...formData,
          projectId,
          createdAt: new Date().toISOString()
        };
        const newIssue = await createIssue(issueData);
        if (onCreated) onCreated(newIssue);
        handleClose();
      }
    } catch (error) {
      console.error('Error guardando incidencia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: initialType || 'Calidad',
      status: 'Abierta',
      priority: 'Media',
      assignedTo: '',
      level: 'Nivel 1',
      plan: 'Plano A101',
      image: null
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Nueva Incidencia</Typography>
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Título de la incidencia"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              size="small"
            />
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select name="type" value={formData.type} label="Tipo" onChange={handleChange}>
                <MenuItem value="Obra">Obra</MenuItem>
                <MenuItem value="Diseño">Diseño</MenuItem>
                <MenuItem value="Calidad">Calidad</MenuItem>
                <MenuItem value="Seguridad">Seguridad</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Prioridad</InputLabel>
              <Select name="priority" value={formData.priority} label="Prioridad" onChange={handleChange}>
                <MenuItem value="Alta">Alta</MenuItem>
                <MenuItem value="Media">Media</MenuItem>
                <MenuItem value="Baja">Baja</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Asignado a"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Ubicación (Nivel/Plano)"
              name="level"
              value={formData.level}
              onChange={handleChange}
              placeholder="Ej: Nivel 1 - A101"
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ border: '1px dashed #ccc', p: 2, textAlign: 'center', borderRadius: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                size="small"
              >
                Subir Imagen / Captura
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, image: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
              {formData.image && (
                <Box sx={{ mt: 2 }}>
                  <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 4 }} />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} sx={{ color: '#5F6B7A' }}>Cancelar</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.title}
          sx={{ bgcolor: '#1F3A5F', fontWeight: 'bold' }}
        >
          {isSubmitting ? 'Guardando...' : 'Crear Incidencia'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateIssueDialog;
