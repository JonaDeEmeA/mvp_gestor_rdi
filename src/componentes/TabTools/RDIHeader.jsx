import React from 'react';
import { Box, Button, Chip, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { HeaderSection } from './LayoutSections';

const RDIHeader = ({ 
  showForm, 
  onAddRDI, 
  onImportBCF, 
  rdiCount 
}) => {
  console.log('📋 PASO 4: Renderizando RDIHeader');
  console.log('  ├─ Formulario visible:', showForm);
  console.log('  └─ Total RDIs:', rdiCount);
  
  return (
    <HeaderSection>
      <Stack spacing={2}>
        {/* Fila 1: Botones de acción */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddRDI}
            disabled={showForm}
            fullWidth
            size="small"
          >
            Agregar RDI
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FolderOpenIcon />}
            onClick={onImportBCF}
            disabled={showForm}
            fullWidth
            size="small"
          >
            Abrir BCF
          </Button>
        </Stack>
      
      </Stack>
    </HeaderSection>
  );
};

export default RDIHeader;
