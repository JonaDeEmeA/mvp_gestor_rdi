import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { FooterSection } from './LayoutSections';

const RDIFooter = ({ 
  rdiList, 
  bcfTopicSet,
  onExportAll, 
  onDeleteAll 
}) => {
  console.log('📋 PASO 5: Renderizando RDIFooter');
  console.log('  └─ RDIs disponibles:', rdiList.length);
  
  // Calcular estadísticas rápidas
  const stats = {
    total: rdiList.length,
    pendientes: rdiList.filter(r => r.estado === 'Pendiente').length,
    resueltos: rdiList.filter(r => r.estado === 'Resuelto').length,
  };

  return (
    <FooterSection>
      <Stack spacing={1.5}>
        

        {/* Fila 2: Acciones masivas */}
        {rdiList.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CloudUploadIcon />}
              onClick={onExportAll}
              fullWidth
              size="small"
              sx={{ fontSize: '0.75rem' }}
            >
              Exportar Todos ({stats.total})
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={onDeleteAll}
              fullWidth
              size="small"
              sx={{ fontSize: '0.75rem' }}
            >
              Eliminar Todos
            </Button>
          </Stack>
        )}
      </Stack>
    </FooterSection>
  );
};

export default RDIFooter;

console.log('✅ PASO 5 COMPLETADO: RDIFooter creado');