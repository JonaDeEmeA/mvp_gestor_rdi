import React from 'react';
import {
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import FloatingWindow from './FloatingWindow';

const SectionManagerWindow = ({ open, onClose, planes = [], onDeletePlane, onTogglePlane }) => {
  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title="Gestor de Secciones"
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          {planes.length === 0
            ? 'No hay planos creados. Haz doble clic en el modelo.'
            : `${planes.length} plano(s) activo(s)`}
        </Typography>

        <List dense>
          {planes.map((plane, index) => (
            <React.Fragment key={index}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="toggle visibility" onClick={() => onTogglePlane(plane)} sx={{ mr: 1 }}>
                      {plane.enabled ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => onDeletePlane(plane)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                sx={{ opacity: plane.enabled ? 1 : 0.6 }}
              >
                <ListItemText
                  primary={`Plano de sección ${index + 1}`}
                  secondary={`Posición: ${plane.helper?.position
                    ? `${plane.helper.position.x.toFixed(2)}, ${plane.helper.position.y.toFixed(2)}, ${plane.helper.position.z.toFixed(2)}`
                    : 'N/A'
                    }`}
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
              {index < planes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 2, p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Usa Delete o Backspace para borrar plano bajo el mouse
          </Typography>
        </Box>
      </Box>
    </FloatingWindow>
  );
};

export default SectionManagerWindow;

