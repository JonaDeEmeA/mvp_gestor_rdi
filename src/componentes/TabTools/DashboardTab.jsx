import React from 'react';
import { Paper, Box, Typography, Card, CardContent, Grid, Stack, Chip, Divider } from '@mui/material';
import { HeaderSection, ContentSection } from './LayoutSections';
import { BIM_COLORS } from '../../constants/designTokens';

const DashboardTab = ({ rdiList, bcfTopicSet }) => {
  const totalRDIs = rdiList.length;

  const statusStats = Array.from(bcfTopicSet.statuses || []).map(status => ({
    status,
    count: rdiList.filter(rdi => rdi.estado === status || rdi.statuses === status).length
  }));

  const typeStats = Array.from(bcfTopicSet.types || []).map(type => ({
    type,
    count: rdiList.filter(rdi => rdi.tipo === type || rdi.types === type).length
  }));

  const labelStats = Array.from(bcfTopicSet.labels || []).map(label => ({
    label,
    count: rdiList.filter(rdi => rdi.etiqueta === label || rdi.labels === label).length
  }));

  if (totalRDIs === 0) {
    return (
      <Box sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: 'column',
        gap: 2,
        bgcolor: BIM_COLORS.neutral.background.main
      }}>
        <Typography variant="h3" sx={{ opacity: 0.3 }}>📊</Typography>
        <Typography variant="body1" sx={{ color: BIM_COLORS.neutral.text.secondary, fontWeight: 'medium' }}>
          No hay datos para mostrar
        </Typography>
        <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled }}>
          Crea tu primer RDI para ver estadísticas
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: "100%",
      display: 'flex',
      flexDirection: 'column',
      bgcolor: BIM_COLORS.neutral.background.main,
      overflow: 'hidden'
    }}>
      {/* Header con resumen */}
      <HeaderSection sx={{ bgcolor: BIM_COLORS.neutral.background.secondary, borderBottom: `1px solid ${BIM_COLORS.neutral.border}` }}>
        <Stack direction="row" justifyContent="space-around" sx={{ width: '100%' }}>
          <Stack spacing={0.5} alignItems="center">
            <Typography variant="h4" sx={{ color: BIM_COLORS.primary.main, fontWeight: 'bold', lineHeight: 1 }}>
              {totalRDIs}
            </Typography>
            <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, textTransform: 'uppercase', fontWeight: 'bold' }}>
              Total RDIs
            </Typography>
          </Stack>
          <Divider orientation="vertical" flexItem sx={{ borderColor: BIM_COLORS.neutral.border }} />
          <Stack spacing={0.5} alignItems="center">
            <Typography variant="h4" sx={{ color: BIM_COLORS.accent.main, fontWeight: 'bold', lineHeight: 1 }}>
              {rdiList.filter(r => (r.estado || r.statuses) === 'Resuelto').length}
            </Typography>
            <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, textTransform: 'uppercase', fontWeight: 'bold' }}>
              Resueltos
            </Typography>
          </Stack>
        </Stack>
      </HeaderSection>

      {/* Content scrollable con cards */}
      <ContentSection>
        <Stack spacing={2} sx={{ pb: 2 }}>
          {/* Card: Por Estado */}
          <Card variant="outlined" sx={{ borderColor: BIM_COLORS.neutral.border, borderRadius: 1 }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: BIM_COLORS.primary.main }}>
                Distribución por Estado
              </Typography>
              <Stack spacing={1}>
                {statusStats.map(({ status, count }) => (
                  <Box key={status} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 0.5,
                    bgcolor: BIM_COLORS.neutral.background.secondary,
                    border: `1px solid ${BIM_COLORS.neutral.border}`
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{status}</Typography>
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: status === 'Resuelto' ? BIM_COLORS.accent.soft : BIM_COLORS.status.warning.soft,
                        color: status === 'Resuelto' ? BIM_COLORS.accent.main : BIM_COLORS.status.warning.main,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Card: Por Especialidad */}
          <Card variant="outlined" sx={{ borderColor: BIM_COLORS.neutral.border, borderRadius: 1 }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: BIM_COLORS.primary.main }}>
                Por Especialidad
              </Typography>
              <Grid container spacing={1}>
                {labelStats.map(({ label, count }) => (
                  <Grid item xs={6} key={label}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        borderColor: BIM_COLORS.neutral.border,
                        bgcolor: BIM_COLORS.neutral.background.secondary,
                        '&:hover': { borderColor: BIM_COLORS.primary.main, bgcolor: 'white' }
                      }}
                    >
                      <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, display: 'block', mb: 0.5 }}>
                        {label}
                      </Typography>
                      <Typography variant="h6" sx={{ color: BIM_COLORS.primary.main, fontWeight: 'bold', lineHeight: 1 }}>
                        {count}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Card: RDIs Recientes */}
          <Card variant="outlined" sx={{ borderColor: BIM_COLORS.neutral.border, borderRadius: 1 }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: BIM_COLORS.primary.main }}>
                Registros Recientes
              </Typography>
              <Stack spacing={1}>
                {rdiList.slice(-3).reverse().map((rdi) => (
                  <Box
                    key={rdi.id}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: BIM_COLORS.neutral.border,
                      borderRadius: 1,
                      bgcolor: 'white',
                      '&:hover': { borderColor: BIM_COLORS.primary.main, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: BIM_COLORS.neutral.text.primary, mb: 1 }}>
                      {rdi.titulo || rdi.title}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={rdi.tipo || rdi.types}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 20, bgcolor: BIM_COLORS.primary.soft, color: BIM_COLORS.primary.main }}
                      />
                      <Chip
                        label={rdi.estado || rdi.statuses}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          bgcolor: (rdi.estado || rdi.statuses) === 'Resuelto' ? BIM_COLORS.accent.soft : BIM_COLORS.status.warning.soft,
                          color: (rdi.estado || rdi.statuses) === 'Resuelto' ? BIM_COLORS.accent.main : BIM_COLORS.status.warning.main
                        }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </ContentSection>
    </Box>
  );
};

export default DashboardTab;