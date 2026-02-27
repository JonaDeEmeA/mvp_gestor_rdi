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
          zIndex: 110,
          width: 30,
          height: 30,
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
