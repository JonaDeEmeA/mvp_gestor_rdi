import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FloatingWindow from './FloatingWindow';

/**
 * Componente Explorador de Modelos
 * @param {Object} props
 * @param {boolean} props.open - Controla si la ventana es visible
 * @param {string} props.title - Título de la ventana
 * @param {Function} props.onClose - Función al cerrar la ventana
 * @param {Array} props.listaModelos - Lista de modelos cargados
 * @param {Function} props.ocultarModelo - Función para alternar visibilidad
 */
export default function Browser({ open, onClose, title = "Explorador", listaModelos = [], ocultarModelo }) {
  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title={title}
      width="320px"
      height="450px"
    >
      <List dense>
        {listaModelos.map((item) => (
          <ListItem key={item.object.uuid}>
            <ListItemAvatar>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                {item.object.name.slice(0, 3).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={item.object.name}
              primaryTypographyProps={{ fontSize: '0.85rem', noWrap: true }}
            />
            <ListItemIcon>
              <IconButton edge="end" aria-label="visibility" onClick={() => ocultarModelo(item.object.uuid)}>
                {item.object.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
              </IconButton>
            </ListItemIcon>
          </ListItem>
        ))}
      </List>

      {listaModelos.length === 0 && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No hay modelos cargados.
          </Typography>
        </Box>
      )}
    </FloatingWindow>
  );
}
