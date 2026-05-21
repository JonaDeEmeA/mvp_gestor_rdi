import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Divider,
  Avatar
} from '@mui/material';
import {
  FolderOpen as FolderIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  DeleteOutline as DeleteIcon,
  Storage as StorageIcon,
  Description as FileIcon,
  SettingsInputComponent as ConnectIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useLocalModels } from '../../hooks/useLocalModels';

export default function ModelosPanel({ projectId }) {
  const router = useRouter();
  const { 
    models, 
    loading, 
    folderHandle, 
    needsPermission, 
    isSupported,
    connect, 
    authorize, 
    disconnect, 
    refresh 
  } = useLocalModels();

  const handleViewModel = (model) => {
    // Para el MVP, redirigimos al visor. 
    // Podríamos pasar el nombre del archivo para que el visor lo cargue automáticamente
    router.push(`/viewer?model=${model.name}`);
  };

  if (!isSupported) {
    return (
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          bgcolor: '#FFF5F5', 
          borderRadius: 4, 
          borderColor: '#FED7D7',
          maxWidth: 600,
          mx: 'auto',
          mt: 4
        }}
      >
        <WarningIcon sx={{ fontSize: 60, color: '#E53E3E', mb: 2 }} />
        <Typography variant="h5" sx={{ color: '#C53030', fontWeight: 'bold', mb: 2 }}>
          Navegador No Compatible
        </Typography>
        <Typography variant="body1" sx={{ color: '#742A2A', mb: 4 }}>
          Tu navegador actual no soporta la tecnología necesaria para acceder a carpetas locales de forma directa.
        </Typography>
        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, textAlign: 'left', border: '1px solid #FEB2B2' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Para usar esta funcionalidad, por favor utiliza:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li><strong>Google Chrome</strong> (Versión 86+)</li>
              <li><strong>Microsoft Edge</strong> (Versión 86+)</li>
              <li><strong>Opera</strong> (Versión 72+)</li>
            </ul>
          </Typography>
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#9B2C2C', fontStyle: 'italic' }}>
            Nota: Firefox y Safari aún no soportan esta característica por políticas de seguridad.
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cabecera de la sección */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#1E1E1E', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon sx={{ color: '#1F3A5F' }} />
            Repositorio de Modelos
          </Typography>
          <Typography variant="body2" sx={{ color: '#5F6B7A' }}>
            Gestiona los archivos IFC y Fragments de tu proyecto
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {folderHandle && !needsPermission && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Refrescar
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={connect}
            sx={{ 
              bgcolor: '#1F3A5F', 
              textTransform: 'none', 
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#2B5DAF' }
            }}
          >
            {folderHandle ? 'Cambiar Carpeta' : 'Conectar Carpeta Local'}
          </Button>
        </Box>
      </Box>

      {/* Estado de la conexión */}
      {!folderHandle ? (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: 'white', 
            borderRadius: 2, 
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#D9DEE5'
          }}
        >
          <ConnectIcon sx={{ fontSize: 48, color: '#D9DEE5', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#5F6B7A', mb: 1 }}>
            No hay una carpeta conectada
          </Typography>
          <Typography variant="body2" sx={{ color: '#9AA4AF', mb: 3, maxWidth: 400, mx: 'auto' }}>
            Conecta una carpeta local de tu computadora para listar y visualizar tus modelos 3D automáticamente.
          </Typography>
          <Button
            variant="outlined"
            onClick={connect}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Configurar Repositorio Local
          </Button>
        </Paper>
      ) : needsPermission ? (
        <Paper 
          sx={{ 
            p: 3, 
            bgcolor: '#FFF4E5', 
            color: '#663C00', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderRadius: 2,
            border: '1px solid #FFD599'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningIcon color="warning" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Se requiere permiso de acceso
              </Typography>
              <Typography variant="body2">
                El navegador requiere que confirmes el acceso a la carpeta para esta sesión.
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            color="warning" 
            onClick={authorize}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Permitir Acceso
          </Button>
        </Paper>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
            <FolderIcon sx={{ color: '#9AA4AF', fontSize: '1rem' }} />
            <Typography variant="caption" sx={{ color: '#9AA4AF', fontWeight: 'medium' }}>
              Carpeta conectada: {folderHandle.name}
            </Typography>
            <Button 
              size="small" 
              color="error" 
              onClick={disconnect}
              sx={{ fontSize: '0.65rem', minWidth: 'auto', ml: 1 }}
            >
              Desconectar
            </Button>
          </Box>

          <Grid container spacing={2}>
            {models.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#9AA4AF' }}>
                    No se encontraron archivos .ifc o .frag en esta carpeta.
                  </Typography>
                </Box>
              </Grid>
            ) : (
              models.map((model) => (
                <Grid item xs={12} sm={6} md={4} key={model.id}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      borderRadius: 2, 
                      border: '1px solid #E0E4E8',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#1F3A5F',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: model.name.endsWith('.ifc') ? '#E3F2FD' : '#F3E5F5', color: model.name.endsWith('.ifc') ? '#1976D2' : '#7B1FA2', borderRadius: 1.5 }}>
                          <FileIcon />
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
                            {model.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9AA4AF' }}>
                            {model.name.endsWith('.ifc') ? 'IFC Model' : 'Fragment Model'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <Divider sx={{ opacity: 0.6 }} />
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                      <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        Local
                      </Typography>
                      <Box>
                        <Tooltip title="Visualizar en 3D">
                          <IconButton size="small" onClick={() => handleViewModel(model)} sx={{ color: '#1F3A5F' }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Quitar de la lista">
                          <IconButton size="small" color="error" sx={{ opacity: 0.5 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Footer Info */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(31, 58, 95, 0.03)', borderRadius: 2, borderLeft: '4px solid #1F3A5F' }}>
        <Typography variant="caption" sx={{ color: '#5F6B7A', display: 'block' }}>
          <strong>Nota de Implementación:</strong> Esta sección utiliza la File System Access API para trabajar con archivos locales. 
          Los archivos no se suben a ningún servidor, permanecen en tu equipo. Esta capa es intercambiable por una base de datos en la nube en el futuro.
        </Typography>
      </Box>
    </Box>
  );
}
