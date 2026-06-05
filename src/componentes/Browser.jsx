import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as LoadIcon,
  FolderSpecial as RepositoryIcon,
  Layers as LayersIcon,
  FilePresent as FileIcon
} from '@mui/icons-material';
import FloatingWindow from './FloatingWindow';

/**
 * Componente Explorador de Modelos Mejorado
 */
export default function Browser({ 
  open, 
  onClose, 
  title = "Explorador", 
  listaModelos = [], 
  ocultarModelo,
  localModels = [],
  onLoadLocal,
  localNeedsPermission,
  onAuthorizeLocal,
  onConnectLocal
}) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title={title}
      width="350px"
      height="500px"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ minHeight: 40, '& .MuiTab-root': { py: 1, fontSize: '0.75rem', minHeight: 40 } }}
        >
          <Tab icon={<LayersIcon sx={{ fontSize: '1.1rem' }} />} label="ESCENA" iconPosition="start" />
          <Tab icon={<RepositoryIcon sx={{ fontSize: '1.1rem' }} />} label="REPOSITORIO" iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* TAB 1: MODELOS EN ESCENA */}
        {tabValue === 0 && (
          <List dense>
            {listaModelos.map((item) => (
              <ListItem key={item.object.uuid}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', bgcolor: '#1F3A5F' }}>
                    {item.object.name.slice(0, 3).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.object.name}
                  primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, fontWeight: 'medium' }}
                />
                <ListItemIcon>
                  <IconButton edge="end" size="small" onClick={() => ocultarModelo(item.object.uuid)}>
                    {item.object.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                  </IconButton>
                </ListItemIcon>
              </ListItem>
            ))}

            {listaModelos.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                <LayersIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">No hay modelos en la escena.</Typography>
              </Box>
            )}
          </List>
        )}

        {/* TAB 2: REPOSITORIO LOCAL */}
        {tabValue === 1 && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {localNeedsPermission ? (
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#5F6B7A', fontSize: '0.75rem' }}>
                  Para guardar archivos .frag en la carpeta local, se necesita permiso de <strong>lectura y escritura</strong>. Reconecta la carpeta para otorgarlo.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onAuthorizeLocal}
                    sx={{ textTransform: 'none', flex: 1 }}
                  >
                    Re-autorizar
                  </Button>
                  {onConnectLocal && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={onConnectLocal}
                      sx={{ textTransform: 'none', flex: 1 }}
                    >
                      Reconectar
                    </Button>
                  )}
                </Box>
              </Box>
            ) : localModels.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                <RepositoryIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">Repositorio local vacío o no conectado.</Typography>
              </Box>
            ) : (
              <List dense>
                {localModels.map((model) => {
                  const isLoaded = listaModelos.some(m => m.object.name === model.name);
                  return (
                    <ListItem 
                      key={model.id}
                      sx={{ 
                        opacity: isLoaded ? 0.6 : 1,
                        bgcolor: isLoaded ? 'rgba(0,0,0,0.02)' : 'transparent'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: model.name.endsWith('.ifc') ? '#E3F2FD' : '#F3E5F5', color: model.name.endsWith('.ifc') ? '#1976D2' : '#7B1FA2' }}>
                          <FileIcon sx={{ fontSize: '1rem' }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={model.name}
                        secondary={isLoaded ? "Cargado" : (model.name.endsWith('.ifc') ? "IFC" : "Frag")}
                        primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true, fontWeight: isLoaded ? 'normal' : 'bold' }}
                        secondaryTypographyProps={{ fontSize: '0.65rem' }}
                      />
                      <ListItemIcon>
                        <Tooltip title={isLoaded ? "Ya está en la escena" : "Cargar modelo"}>
                          <span>
                            <IconButton 
                              edge="end" 
                              size="small" 
                              disabled={isLoaded}
                              onClick={() => onLoadLocal(model)}
                              sx={{ color: '#4CAF50' }}
                            >
                              <LoadIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </ListItemIcon>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        )}
      </Box>
      
      <Divider />
      <Box sx={{ p: 1, textAlign: 'right' }}>
        <Typography variant="caption" sx={{ color: '#9AA4AF', fontSize: '0.6rem' }}>
          {tabValue === 0 ? `${listaModelos.length} modelos en escena` : `${localModels.length} archivos disponibles`}
        </Typography>
      </Box>
    </FloatingWindow>
  );
}
