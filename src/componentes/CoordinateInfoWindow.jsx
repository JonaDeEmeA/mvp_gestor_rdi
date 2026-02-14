import React from 'react';
import {
  Typography,
  Box,
  Divider
} from '@mui/material';
import FloatingWindow from './FloatingWindow';

/**
 * Componente que muestra la información de coordenadas
 * @param {Object} props
 * @param {boolean} props.open - Controla si la ventana es visible
 * @param {Function} props.onClose - Función al cerrar la ventana
 * @param {Object} props.point - Objeto con coordenadas {x, y, z}
 */
const CoordinateInfoWindow = ({ open, onClose, point }) => {
  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title="Información de Coordenadas"
      height="250px"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Haz clic en cualquier punto del modelo para ver sus coordenadas exactas.
        </Typography>

        <Divider />

        {point ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">Eje X:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{point.x.toFixed(4)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">Eje Y:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{point.y.toFixed(4)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">Eje Z:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{point.z.toFixed(4)}</Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="warning.main" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
            Ningún punto seleccionado
          </Typography>
        )}

        <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Modo Selección: Activo
          </Typography>
        </Box>
      </Box>
    </FloatingWindow>
  );
};

export default CoordinateInfoWindow;
