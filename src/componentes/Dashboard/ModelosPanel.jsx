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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'center' },
        gap: 2 
      }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#1E1E1E', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon sx={{ color: '#1F3A5F' }} />
            Repositorio de Modelos
          </Typography>
          <Typography variant="body2" sx={{ color: '#5F6B7A' }}>
            Gestiona los archivos IFC y Fragments de tu proyecto
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 1.5,
          width: { xs: '100%', md: 'auto' }
        }}>
          {folderHandle && !needsPermission && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' }
              }}
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
              width: { xs: '100%', sm: 'auto' },
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
            p: { xs: 3, sm: 4 }, 
            textAlign: 'center', 
            bgcolor: 'white', 
            borderRadius: 2, 
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#D9DEE5'
          }}
        >
          <ConnectIcon sx={{ fontSize: 48, color: '#D9DEE5', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#5F6B7A', mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            No hay una carpeta conectada
          </Typography>
          <Typography variant="body2" sx={{ color: '#9AA4AF', mb: 3, maxWidth: 400, mx: 'auto' }}>
            Conecta una carpeta local de tu computadora para listar y visualizar tus modelos 3D automáticamente.
          </Typography>
          <Button
            variant="outlined"
            onClick={connect}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'bold',
              width: { xs: '100%', sm: 'auto' }
            }}
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
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' }, 
            justifyContent: 'space-between',
            borderRadius: 2,
            border: '1px solid #FFD599',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <WarningIcon color="warning" sx={{ mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Se requiere permiso de lectura y escritura
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                Para guardar automáticamente los archivos .frag generados en la carpeta local, reconecta la carpeta haciendo clic en &ldquo;Cambiar Carpeta&rdquo; y acepta el permiso de <strong>lectura y escritura</strong>.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 1.5,
            justifyContent: 'flex-end'
          }}>
            <Button 
              variant="outlined"
              color="warning"
              onClick={authorize}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 'bold', 
                whiteSpace: 'nowrap',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Re-autorizar
            </Button>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={connect}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 'bold', 
                whiteSpace: 'nowrap',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Reconectar Carpeta
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: 1, 
            mb: 2, 
            px: 1 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderIcon sx={{ color: '#9AA4AF', fontSize: '1rem' }} />
              <Typography variant="caption" sx={{ color: '#9AA4AF', fontWeight: 'medium', wordBreak: 'break-all' }}>
                Carpeta conectada: {folderHandle.name}
              </Typography>
            </Box>
            <Button 
              size="small" 
              color="error" 
              onClick={disconnect}
              sx={{ 
                fontSize: '0.65rem', 
                minWidth: 'auto', 
                ml: { xs: 0, sm: 1 },
                mt: { xs: 0.5, sm: 0 },
                alignSelf: { xs: 'flex-start', sm: 'center' }
              }}
            >
              Desconectar
            </Button>
          </Box>

          {/* Desktop Table View */}
          <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' }, border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>Modelo / Archivo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>Formato</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>Ubicación</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {models.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        No se encontraron archivos .ifc o .frag en esta carpeta.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model) => {
                    const isIfc = model.name.toLowerCase().endsWith('.ifc') || model.name.toLowerCase().endsWith('.ifcxml');
                    return (
                      <TableRow key={model.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              width: 36, 
                              height: 36, 
                              bgcolor: isIfc ? '#E3F2FD' : '#F3E5F5', 
                              color: isIfc ? '#1976D2' : '#7B1FA2', 
                              borderRadius: 1.5 
                            }}>
                              <FileIcon sx={{ fontSize: '1.2rem' }} />
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E293B', noWrap: true }}>
                                {model.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                {isIfc ? 'Modelo de Información de Construcción' : 'Modelo Optimizado para Visualización'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={isIfc ? 'IFC' : 'FRAG'} 
                            size="small" 
                            sx={{ 
                              bgcolor: isIfc ? '#E3F2FD' : '#F3E5F5', 
                              color: isIfc ? '#0D47A1' : '#4A148C', 
                              fontWeight: 'bold',
                              borderRadius: '4px',
                              fontSize: '0.7rem'
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                            Carpeta Local
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewModel(model)}
                              sx={{
                                color: '#1F3A5F',
                                borderColor: 'rgba(31, 58, 95, 0.4)',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                '&:hover': { 
                                  bgcolor: 'rgba(31, 58, 95, 0.04)',
                                  borderColor: '#1F3A5F'
                                }
                              }}
                            >
                              Ver en Visor 3D
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Cards View */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
            {models.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2, borderColor: '#E2E8F0' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  No se encontraron archivos .ifc o .frag en esta carpeta.
                </Typography>
              </Paper>
            ) : (
              models.map((model) => {
                const isIfc = model.name.toLowerCase().endsWith('.ifc') || model.name.toLowerCase().endsWith('.ifcxml');
                return (
                  <Card 
                    key={model.id} 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 2, 
                      borderColor: '#E2E8F0',
                      boxShadow: 'none',
                      bgcolor: 'white'
                    }}
                  >
                    <CardContent sx={{ p: 2, pb: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: isIfc ? '#E3F2FD' : '#F3E5F5', 
                          color: isIfc ? '#1976D2' : '#7B1FA2', 
                          borderRadius: 1.5 
                        }}>
                          <FileIcon sx={{ fontSize: '1.4rem' }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E293B', wordBreak: 'break-all' }}>
                            {model.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                            {isIfc ? 'Modelo de Información de Construcción' : 'Modelo Optimizado para Visualización'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={isIfc ? 'IFC' : 'FRAG'} 
                          size="small" 
                          sx={{ 
                            bgcolor: isIfc ? '#E3F2FD' : '#F3E5F5', 
                            color: isIfc ? '#0D47A1' : '#4A148C', 
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }} 
                        />
                        <Typography variant="caption" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                          Carpeta Local
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ p: 1.5, bgcolor: '#F8FAFC' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewModel(model)}
                        sx={{
                          bgcolor: '#1F3A5F',
                          textTransform: 'none',
                          fontWeight: 'bold',
                          '&:hover': { bgcolor: '#2B5DAF' }
                        }}
                      >
                        Ver en Visor 3D
                      </Button>
                    </CardActions>
                  </Card>
                );
              })
            )}
          </Box>
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
