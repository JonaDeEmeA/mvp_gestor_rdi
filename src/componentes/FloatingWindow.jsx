import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import Draggable from 'react-draggable';

/**
 * Componente de ventana flotante reutilizable
 * @param {Object} props
 * @param {boolean} props.open - Controla si la ventana es visible
 * @param {string} props.title - Título de la ventana
 * @param {Function} props.onClose - Función al cerrar la ventana
 * @param {React.ReactNode} props.children - Contenido de la ventana
 * @param {string} props.width - Ancho en desktop (default: 300px)
 * @param {string} props.height - Alto en desktop (default: 500px)
 */
const FloatingWindow = ({
  open,
  onClose,
  title,
  children,
  width = '300px',
  height = '500px'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const nodeRef = React.useRef(null);

  if (!open) return null;

  const windowContent = (
    <Paper
      ref={nodeRef}
      elevation={3}
      sx={{
        width: isMobile ? '100%' : width,
        height: isMobile ? '30vh' : height,
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
      {/* Header / Handle para arrastre */}
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
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Cuerpo de la ventana */}
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {children}
      </Box>
    </Paper>
  );

  if (isMobile) {
    return windowContent;
  }

  return (
    <Draggable
      handle=".handle"
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: 20, y: 20 }}
    >
      {windowContent}
    </Draggable>
  );
};

export default FloatingWindow;
