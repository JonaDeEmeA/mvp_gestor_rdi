import React from 'react';
import {
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import FloatingWindow from './FloatingWindow';

/**
 * Extrae el valor legible de una propiedad IFC.
 * @param {any} property - La propiedad a procesar.
 * @returns {string} El valor en formato string.
 */
const getPropertyValue = (property) => {
  if (property === null || property === undefined) return '';
  if (typeof property !== 'object') return String(property);
  if (property.value !== undefined) return String(property.value);
  return 'Objeto complejo';
};

/**
 * Componente que muestra las propiedades IFC del elemento seleccionado
 * @param {Object} props
 * @param {boolean} props.open - Controla si la ventana es visible
 * @param {Function} props.onClose - Función al cerrar la ventana
 * @param {Object} props.properties - Datos de las propiedades del elemento
 */
const PropertyWindow = ({ open, onClose, properties }) => {
  
  // Función para renderizar los pares clave-valor de forma limpia
  const renderProperties = () => {
    if (!properties) return null;

    // Obtener todas las propiedades y filtrar las legibles
    const entries = Object.entries(properties).filter(([key, value]) => {
      if (value === null || value === undefined) return false;
      // Permitir primitivos y objetos que tengan una propiedad 'value'
      return typeof value !== 'object' || value.value !== undefined;
    });

    if (entries.length === 0) {
      return (
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', p: 2 }}>
          No hay propiedades disponibles para este elemento.
        </Typography>
      );
    }

    return (
      <List dense sx={{ width: '100%', p: 0 }}>
        {entries.map(([key, value]) => (
          <ListItem 
            key={key} 
            divider 
            sx={{ 
              px: 0, 
              py: 1,
              flexDirection: 'column', 
              alignItems: 'flex-start' 
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase' }}>
              {key}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {getPropertyValue(value)}
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title="Propiedades IFC"
      height="450px"
      width="320px"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {properties ? (
          <Box>
            {properties.Name && (
              <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, bgcolor: 'rgba(31, 58, 95, 0.04)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {getPropertyValue(properties.Name)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tipo: {getPropertyValue(properties.type) || 'N/A'}
                </Typography>
              </Paper>
            )}
            
            <Box sx={{ flex: 1 }}>
               {renderProperties()}
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 6, 
            opacity: 0.5 
          }}>
            <Typography variant="h4">🔍</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selecciona un elemento para ver sus datos
            </Typography>
          </Box>
        )}
      </Box>
    </FloatingWindow>
  );
};

export default PropertyWindow;
