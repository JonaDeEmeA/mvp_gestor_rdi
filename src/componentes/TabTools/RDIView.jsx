import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Paper, 
  Grid, 
  Divider, 
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  CameraAlt as CameraIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

// ✅ PASO 2.1: Componente para Cards de Información Principal
const InfoCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  console.log('📋 PASO 2.1: Renderizando InfoCard:', label);
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          borderColor: `${color}.main`
        }
      }}
    >
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 1,
        p: 2
      }}>
        <Avatar sx={{ 
          bgcolor: `${color}.main`, 
          width: 40, 
          height: 40 
        }}>
          <Icon fontSize="small" />
        </Avatar>
        <Typography 
          variant="caption" 
          color="text.secondary"
          textAlign="center"
          sx={{ fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Typography 
          variant="body2" 
          fontWeight="bold"
          textAlign="center"
          color={color}
        >
          {value || 'No especificado'}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ✅ PASO 2.2: Componente para Filas de Detalle
const DetailRow = ({ icon: Icon, label, value, color = 'text.secondary' }) => {
  console.log('📋 PASO 2.2: Renderizando DetailRow:', label);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: 1.5,
      py: 1,
      px: 1.5,
      borderRadius: 1,
      '&:hover': {
        bgcolor: 'action.hover'
      }
    }}>
      <Icon sx={{ fontSize: 20, color }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {value || 'No especificado'}
        </Typography>
      </Box>
    </Box>
  );
};

// ✅ PASO 2.3: Componente Principal RDIView Rediseñado
const RDIView = ({ rdi, bcfTopicSet, onEdit, onVerSnapshot, snapshotUrl }) => {
  console.log('═══════════════════════════════════════════');
  console.log('🎨 PASO 2.3: Renderizando RDIView Rediseñado');
  console.log('═══════════════════════════════════════════');
  console.log('  - RDI ID:', rdi?.id);
  console.log('  - Tiene snapshot:', !!rdi?.snapshot);
  console.log('═══════════════════════════════════════════');

  if (!rdi) {
    console.warn('⚠️ RDI no proporcionado');
    return null;
  }

  // Helper para obtener labels
  const getLabel = (options, value) => {
    if (options instanceof Set && options.has(value)) return value;
    return value || 'No especificado';
  };

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificado';
    try {
      return format(new Date(dateString), 'PPPp', { locale: es });
    } catch (error) {
      console.error('Error formateando fecha/hora:', error);
      return dateString;
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      overflow: 'auto',
      '&::-webkit-scrollbar': { width: '8px' },
      '&::-webkit-scrollbar-thumb': { 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        borderRadius: '4px' 
      }
    }}>
      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 1: HEADER CON TÍTULO */}
      {/* ═══════════════════════════════════════ */}
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 1,
        pb: 2,
        borderBottom: 2,
        borderColor: 'primary.main',
        mb: 3
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <InfoIcon />
          {rdi.title || rdi.titulo || 'Detalles del RDI'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {rdi.id}
        </Typography>
      </Box>

      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 2: INFORMACIÓN PRINCIPAL (CARDS) */}
      {/* ═══════════════════════════════════════ */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Información Principal
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <InfoCard
              icon={LabelIcon}
              label="Tipo"
              value={getLabel(bcfTopicSet.types, rdi.tipo)}
              color="primary"
            />
          </Grid>
          <Grid item xs={4}>
            <InfoCard
              icon={FlagIcon}
              label="Estado"
              value={getLabel(bcfTopicSet.statuses, rdi.estado)}
              color="secondary"
            />
          </Grid>
          <Grid item xs={4}>
            <InfoCard
              icon={InfoIcon}
              label="Prioridad"
              value={getLabel(bcfTopicSet.priorities, rdi.prioridad)}
              color="warning"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 3: DETALLES ORGANIZADOS */}
      {/* ═══════════════════════════════════════ */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Detalles
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DetailRow
            icon={LabelIcon}
            label="Etiqueta / Especialidad"
            value={getLabel(bcfTopicSet.labels, rdi.etiqueta)}
            color="info.main"
          />
          <Divider />
          <DetailRow
            icon={PersonIcon}
            label="Autor"
            value={rdi.creationAuthor}
            color="primary.main"
          />
          <Divider />
          <DetailRow
            icon={PersonIcon}
            label="Asignado a"
            value={rdi.assignedTo}
            color="primary.main"
          />
          <Divider />
          <DetailRow
            icon={CalendarIcon}
            label="Fecha de Creación"
            value={formatDateTime(rdi.creationDate)}
            color="success.main"
          />
          <Divider />
          <DetailRow
            icon={CalendarIcon}
            label="Fecha Límite"
            value={formatDate(rdi.dueDate)}
            color="error.main"
          />
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 4: DESCRIPCIÓN */}
      {/* ═══════════════════════════════════════ */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DescriptionIcon sx={{ color: 'text.secondary' }} />
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ fontWeight: 'bold' }}
          >
            Descripción
          </Typography>
        </Box>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            borderRadius: 2,
            bgcolor: 'grey.50',
            minHeight: 80,
            maxHeight: 200,
            overflow: 'auto'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              color: rdi.description ? 'text.primary' : 'text.secondary',
              fontStyle: rdi.description ? 'normal' : 'italic'
            }}
          >
            {rdi.description || 'No hay descripción disponible.'}
          </Typography>
        </Paper>
      </Box>

      {/* ═══════════════════════════════════════ */}
      {/* SECCIÓN 5: SNAPSHOT (Si existe) */}
      {/* ═══════════════════════════════════════ */}
      {rdi.snapshot && snapshotUrl && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CameraIcon sx={{ color: 'text.secondary' }} />
            <Typography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ fontWeight: 'bold' }}
            >
              Vista 3D Guardada
            </Typography>
          </Box>
          <Paper 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              position: 'relative',
              '&:hover .snapshot-overlay': {
                opacity: 1
              }
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <img 
                src={snapshotUrl} 
                alt="Snapshot del RDI" 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block',
                  maxHeight: '250px',
                  objectFit: 'cover'
                }} 
              />
              {/* Overlay con botón */}
              <Box
                className="snapshot-overlay"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={onVerSnapshot}
                  startIcon={<CameraIcon />}
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  Ver en 3D
                </Button>
              </Box>
            </Box>
          </Paper>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ display: 'block', mt: 1, textAlign: 'center' }}
          >
            Haz hover sobre la imagen para ver en 3D
          </Typography>
        </Box>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* FOOTER: Información de Modificación */}
      {/* ═══════════════════════════════════════ */}
      {rdi.updatedAt && (
        <Box sx={{ 
          mt: 4, 
          pt: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          textAlign: 'center' 
        }}>
          <Typography variant="caption" color="text.secondary">
            Última modificación: {formatDateTime(rdi.updatedAt)}
          </Typography>
        </Box>
      )}

      {console.log('✅ PASO 2.3 COMPLETADO: RDIView renderizado')}
    </Box>
  );
};

export default RDIView;

console.log('✅ PASO 2 COMPLETADO: RDIView rediseñado creado');