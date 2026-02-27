import React from 'react';
import { Box, Button, Chip, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { HeaderSection } from './LayoutSections';

import { BIM_COLORS } from '../../constants/designTokens';

const RDIHeader = ({
  showForm,
  onAddRDI,
  onImportBCF,
  rdiCount
}) => {
  return (
    <HeaderSection>
      <Stack spacing={2}>
        {/* Fila 1: Botones de acción */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={onAddRDI}
            disabled={showForm}
            fullWidth
            size="small"
            sx={{
              bgcolor: BIM_COLORS.primary.main,
              '&:hover': { bgcolor: BIM_COLORS.primary.active },
              textTransform: 'none',
              fontWeight: 'bold'
            }}
            startIcon={<AddIcon />}
          >
            Agregar RDI
          </Button>
          <Button
            variant="outlined"
            onClick={onImportBCF}
            disabled={showForm}
            fullWidth
            size="small"
            sx={{
              color: BIM_COLORS.primary.main,
              borderColor: BIM_COLORS.primary.main,
              '&:hover': {
                borderColor: BIM_COLORS.primary.active,
                bgcolor: BIM_COLORS.primary.soft
              },
              textTransform: 'none',
              fontWeight: 'bold'
            }}
            startIcon={<FolderOpenIcon />}
          >
            Abrir BCF
          </Button>
        </Stack>
      </Stack>
    </HeaderSection>
  );
};

export default RDIHeader;
