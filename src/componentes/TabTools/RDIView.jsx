import React from 'react';
import { BIM_COLORS } from '../../constants/designTokens';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Stack,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  CameraAlt as CameraIcon,
  Flag as FlagIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// Componente para Cards de Información Principal
const InfoCard = ({ icon: Icon, label, value, bgcolor, color = 'white' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: 1,
        bgcolor: bgcolor || BIM_COLORS.primary.main,
        color: color,
        border: `1px solid ${BIM_COLORS.neutral.border}`,
        flex: 1
      }}
    >
      <Avatar sx={{
        bgcolor: 'rgba(255,255,255,0.2)',
        width: 28,
        height: 28
      }}>
        <Icon sx={{ fontSize: 16, color: 'white' }} />
      </Avatar>
      <Box>
        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', lineHeight: 1, mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {value || 'No especificado'}
        </Typography>
      </Box>
    </Box>
  );
};

// Componente para Filas de Detalle
const DetailRow = ({ icon: Icon, label, value, iconColor = BIM_COLORS.primary.main }) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      py: 1,
      px: 1.5,
      '&:hover': {
        bgcolor: BIM_COLORS.neutral.background.secondary
      }
    }}>
      <Icon sx={{ fontSize: 18, color: iconColor }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'medium', color: BIM_COLORS.neutral.text.primary }}>
          {value || 'No especificado'}
        </Typography>
      </Box>
    </Box>
  );
};

const RDIView = ({ rdi, bcfTopicSet, onEdit, onVerSnapshot, snapshotUrl }) => {
  if (!rdi) return null;

  // Helper para obtener labels
  const getValue = (value) => value || 'No especificado';

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'PPP', { locale: es });
    } catch (error) { return dateString; }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificado';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'PPPp', { locale: es });
    } catch (error) { return dateString; }
  };

  return (
    <Box sx={{
      height: '100%',
      overflow: 'auto',
      bgcolor: BIM_COLORS.neutral.background.main,
      p: 0
    }}>
      {/* SECCIÓN 1: HEADER STICKY */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        bgcolor: BIM_COLORS.primary.main,
        color: 'white',
        zIndex: 5,
        p: 2,
        mb: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              ID: {String(rdi.id || '').substring(0, 8)}...
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {rdi.title || rdi.titulo || 'Detalles del RDI'}
            </Typography>
          </Box>
          <Tooltip title="Editar RDI">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        {/* SECCIÓN 2: INFORMACIÓN PRINCIPAL */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <InfoCard
            icon={LabelIcon}
            label="Tipo"
            value={getValue(rdi.tipo)}
            bgcolor={BIM_COLORS.primary.main}
          />
          <InfoCard
            icon={FlagIcon}
            label="Estado"
            value={getValue(rdi.estado)}
            bgcolor={rdi.estado === 'Resuelto' ? BIM_COLORS.accent.main : BIM_COLORS.status.warning.main}
          />
        </Box>

        {/* SECCIÓN 3: DETALLES */}
        <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontWeight: 'bold', mb: 1, display: 'block', textTransform: 'uppercase' }}>
          Detalles de Coordinación
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: 1, borderColor: BIM_COLORS.neutral.border, mb: 3, overflow: 'hidden' }}>
          <DetailRow
            icon={LabelIcon}
            label="Especialidad"
            value={getValue(rdi.etiqueta)}
            iconColor={BIM_COLORS.status.info.main}
          />
          <Divider sx={{ borderColor: BIM_COLORS.neutral.border }} />
          <DetailRow
            icon={PersonIcon}
            label="Asignado a"
            value={getValue(rdi.assignedTo || rdi.assigned_to)}
          />
          <Divider sx={{ borderColor: BIM_COLORS.neutral.border }} />
          <DetailRow
            icon={CalendarIcon}
            label="Fecha de Creación"
            value={formatDateTime(rdi.creationDate || rdi.creation_date || rdi.createdAt || rdi.fecha)}
            iconColor={BIM_COLORS.accent.main}
          />
          {rdi.dueDate && (
            <>
              <Divider sx={{ borderColor: BIM_COLORS.neutral.border }} />
              <DetailRow
                icon={CalendarIcon}
                label="Fecha Límite"
                value={formatDate(rdi.dueDate)}
                iconColor={BIM_COLORS.status.error.main}
              />
            </>
          )}
        </Paper>

        {/* SECCIÓN 4: DESCRIPCIÓN */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <DescriptionIcon sx={{ fontSize: 18, color: BIM_COLORS.neutral.text.secondary }} />
            <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontWeight: 'bold', textTransform: 'uppercase' }}>
              Descripción
            </Typography>
          </Stack>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: BIM_COLORS.neutral.background.secondary,
              border: `1px solid ${BIM_COLORS.neutral.border}`,
              minHeight: 60
            }}
          >
            <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.primary, whiteSpace: 'pre-wrap' }}>
              {rdi.descripcion || rdi.description || 'Sin descripción disponible.'}
            </Typography>
          </Paper>
        </Box>

        {/* SECCIÓN 5: SNAPSHOT */}
        {rdi.snapshot && snapshotUrl && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CameraIcon sx={{ fontSize: 18, color: BIM_COLORS.neutral.text.secondary }} />
              <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontWeight: 'bold', textTransform: 'uppercase' }}>
                Vista del Modelo
              </Typography>
            </Stack>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 1,
                borderColor: BIM_COLORS.neutral.border,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'black',
                '&:hover .snapshot-btn': { opacity: 1 }
              }}
            >
              <img
                src={snapshotUrl}
                alt="RDI Snapshot"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  margin: '0 auto'
                }}
              />
              <Box
                className="snapshot-btn"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={onVerSnapshot}
                  startIcon={<CameraIcon />}
                  sx={{
                    bgcolor: BIM_COLORS.primary.main,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: BIM_COLORS.primary.active }
                  }}
                >
                  Ver en 3D
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RDIView;