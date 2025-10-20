import React from 'react';
import { Box, Typography, Chip, Paper, Grid, Divider, Button } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper para mostrar un campo de forma consistente
const InfoField = ({ label, value, children }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="caption" color="text.secondary" component="div" gutterBottom>
      {label}
    </Typography>
    {children || (
      <Typography variant="body1" component="div">
        {value || 'No especificado'}
      </Typography>
    )}
  </Grid>
);

const RDIView = ({ rdi, bcfTopicSet, onEdit, onVerSnapshot, snapshotUrl }) => {
  if (!rdi) return null;
console.log(rdi);

  // FIX: La función ahora maneja un Set de strings, no un array de objetos.
  // Simplemente verifica si el valor existe en el Set. Si no, devuelve el valor mismo.
  const getLabel = (options, value) => {
    if (options instanceof Set && options.has(value)) return value;
    return value || 'No especificado';
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            {rdi.title || 'Detalles del RDI'}
          </Typography>
          <Divider />
        </Grid>

        <InfoField label="Tipo">
          <Chip label={getLabel(bcfTopicSet.types, rdi.tipo)} color="primary" size="small" />
        </InfoField>

        <InfoField label="Estado">
          <Chip label={getLabel(bcfTopicSet.statuses, rdi.estado)} color="secondary" size="small" />
        </InfoField>

        <InfoField label="Prioridad">
          <Chip label={getLabel(bcfTopicSet.priorities, rdi.prioridad)} size="small" />
        </InfoField>

        <InfoField label="Etiqueta">
          <Chip label={getLabel(bcfTopicSet.labels, rdi.etiqueta)} size="small" />
        </InfoField>

        <InfoField label="Fecha de Creación" value={rdi.creationDate ? format(new Date(rdi.creationDate), 'PPPp', { locale: es }) : 'No especificado'} />
        <InfoField label="Autor" value={rdi.creationAuthor} />
        <InfoField label="Asignado a" value={rdi.assignedTo} />
        <InfoField label="Fecha Límite" value={rdi.dueDate ? format(new Date(rdi.dueDate), 'PPP', { locale: es }) : 'No especificado'} />

        <Grid item xs={12}>
           <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" component="div" gutterBottom>
            Descripción
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', minHeight: '60px' }}>
            {rdi.description || 'No hay descripción.'}
          </Typography>
        </Grid>

        {rdi.snapshot && (
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" component="div" gutterBottom>
              Snapshot
            </Typography>
            <Box sx={{ position: 'relative', mt: 1 }}>
              <img 
                src={snapshotUrl} 
                alt="Snapshot del RDI" 
                style={{ width: '100%', borderRadius: '4px', border: '1px solid #ddd' }} 
              />
              <Button
                variant="contained"
                size="small"
                onClick={onVerSnapshot}
                sx={{ position: 'absolute', bottom: 8, right: 8 }}
              >
                Ver en 3D
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default RDIView;
