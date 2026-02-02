import React from 'react';
import { Paper, Box, Typography, Card, CardContent, Grid, Stack, Chip, Divider } from '@mui/material';
import { HeaderSection, ContentSection } from './LayoutSections';

const DashboardTab = ({ rdiList, bcfTopicSet }) => {
  console.log('📊 PASO 7: Renderizando DashboardTab reorganizado');
  
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
        gap: 2
      }}>
        <Typography variant="h6" color="text.secondary">
          📊
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No hay datos para mostrar
        </Typography>
        <Typography variant="caption" color="text.disabled">
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
      overflow: 'hidden'
    }}>
      {/* ✅ PASO 7.1: Header con resumen */}
      <HeaderSection>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h5" color="primary" fontWeight="bold">
            {totalRDIs}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total de RDIs
          </Typography>
        </Stack>
      </HeaderSection>

      {/* ✅ PASO 7.2: Content scrollable con cards */}
      <ContentSection>
        <Stack spacing={2}>
          {/* Card: Por Estado */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary">
                📌 Por Estado
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {statusStats.map(({ status, count }) => (
                  <Box key={status} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}>
                    <Typography variant="body2">{status}</Typography>
                    <Chip 
                      label={count} 
                      size="small" 
                      color={status === 'Resuelto' ? 'success' : 'default'}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Card: Por Tipo */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary">
                🏷️ Por Tipo
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {typeStats.map(({ type, count }) => (
                  <Box key={type} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}>
                    <Typography variant="body2">{type}</Typography>
                    <Chip label={count} size="small" color="primary" variant="outlined" />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Card: Por Especialidad */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary">
                🎯 Por Especialidad
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {labelStats.map(({ label, count }) => (
                  <Grid item xs={6} key={label}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        textAlign: 'center',
                        '&:hover': { 
                          boxShadow: 2,
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <Typography variant="caption" display="block" noWrap>
                        {label}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {count}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Card: RDIs Recientes */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary">
                🕐 Recientes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {rdiList.slice(-3).reverse().map((rdi) => (
                  <Box 
                    key={rdi.id} 
                    sx={{ 
                      p: 1.5, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      {rdi.titulo}
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      <Chip label={rdi.tipo || rdi.types} size="small" />
                      <Chip label={rdi.estado || rdi.statuses} size="small" color="secondary" />
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

console.log('✅ PASO 7 COMPLETADO: Dashboard reorganizado con cards');