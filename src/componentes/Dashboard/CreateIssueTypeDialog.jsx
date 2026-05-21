import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Engineering as ConstructionIcon,
  Architecture as DesignIcon,
} from '@mui/icons-material';

const CreateIssueTypeDialog = ({ isOpen, onClose, onSelectType }) => {
  const types = [
    {
      id: 'obra',
      title: 'Incidencia en Obra',
      description: 'Reportar problemas detectados durante la ejecución en terreno.',
      icon: <ConstructionIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      color: '#E8F5E9'
    },
    {
      id: 'diseno',
      title: 'Incidencia en Diseño',
      description: 'Reportar inconsistencias o cambios necesarios en el proyecto técnico.',
      icon: <DesignIcon sx={{ fontSize: 40, color: '#1976D2' }} />,
      color: '#E3F2FD'
    }
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tipo de Incidencia</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Selecciona el tipo de incidencia que deseas reportar para continuar.
        </Typography>
        <Grid container spacing={2}>
          {types.map((type) => (
            <Grid item xs={12} key={type.id}>
              <Paper
                elevation={0}
                onClick={() => onSelectType(type.id)}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.2s',
                  bgcolor: type.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  '&:hover': {
                    borderColor: type.id === 'obra' ? '#4CAF50' : '#1976D2',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
                }}>
                  {type.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
                    {type.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    {type.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIssueTypeDialog;
