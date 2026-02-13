import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import Draggable from 'react-draggable';

const SectionManagerWindow = ({ open, onClose, planes = [], onDeletePlane, onTogglePlane }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const nodeRef = React.useRef(null);

  if (!open) return null;

  const content = (
    <Paper
      ref={nodeRef}
      elevation={3}
      sx={{
        width: isMobile ? '100%' : '300px',
        height: isMobile ? '30vh' : '500px',
        position: 'absolute',
        top: isMobile ? 60 : 0,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: isMobile ? 0 : 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        pointerEvents: 'auto'
      }}
    >
      {/* Header */}
      <Box
        className="handle"
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#1F3A5F',
          color: 'white',
          cursor: isMobile ? 'default' : 'move',
          userSelect: 'none'
        }}
      >
        {!isMobile && <DragIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />}
        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: '0.9rem' }}>
          Gestor de Secciones
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
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
      </Box>

      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Usa Delete o Backspace para borrar plano bajo el mouse
        </Typography>
      </Box>
    </Paper>
  );

  if (isMobile) {
    return content;
  }

  return (
    <Draggable
      handle=".handle"
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: 20, y: 20 }}
    >
      {content}
    </Draggable>
  );
};

export default SectionManagerWindow;
