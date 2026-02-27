import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { FooterSection } from './LayoutSections';
import { BIM_COLORS } from '../../constants/designTokens';

const RDIFooter = ({
  rdiList,
  bcfTopicSet,
  onExportAll,
  onDeleteAll
}) => {
  // Calcular estadísticas rápidas
  const stats = {
    total: rdiList.length,
    pendientes: rdiList.filter(r => (r.estado || r.statuses) === 'Pendiente').length,
    resueltos: rdiList.filter(r => (r.estado || r.statuses) === 'Resuelto').length,
  };

  return (
    <FooterSection>
      <Stack spacing={1.5}>
        {/* Fila 2: Acciones masivas */}
        {rdiList.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={onExportAll}
              fullWidth
              size="small"
              sx={{
                bgcolor: BIM_COLORS.accent.main,
                '&:hover': { bgcolor: BIM_COLORS.accent.active },
                fontSize: '0.75rem',
                textTransform: 'none',
                fontWeight: 'bold'
              }}
              startIcon={<CloudUploadIcon />}
            >
              Exportar Todos ({stats.total})
            </Button>
            <Button
              variant="outlined"
              onClick={onDeleteAll}
              fullWidth
              size="small"
              sx={{
                color: BIM_COLORS.status.error.main,
                borderColor: BIM_COLORS.status.error.main,
                '&:hover': {
                  borderColor: BIM_COLORS.status.error.main,
                  bgcolor: BIM_COLORS.status.error.soft
                },
                fontSize: '0.75rem',
                textTransform: 'none',
                fontWeight: 'bold'
              }}
              startIcon={<DeleteSweepIcon />}
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