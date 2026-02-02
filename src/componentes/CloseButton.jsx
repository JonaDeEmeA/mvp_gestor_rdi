import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Características:
 * - Tamaño pequeño (32x32px)
 * - Hover sutil
 * - Tooltip informativo
 * - Posición absoluta para no afectar layout
 */
const CloseButton = ({ onClose, tooltip = "Cerrar panel" }) => {

  
  return (
    <Tooltip title={tooltip} placement="left">
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          width: 32,
          height: 32,
          padding: 0.5,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'error.light',
            borderColor: 'error.main',
            color: 'error.contrastText',
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          }
        }}
        aria-label="Cerrar panel de herramientas"
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );
};

export default CloseButton;
