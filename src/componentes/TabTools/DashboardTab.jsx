import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const DashboardTab = ({ rdiList, bcfTopicSet }) => {
  // Calcular estadísticas
  const totalRDIs = rdiList.length;
  
  const statusStats = Array.from(bcfTopicSet.statuses || []).map(status => ({
    status,
    count: rdiList.filter(rdi => rdi.statuses === status).length
  }));

  const typeStats = Array.from(bcfTopicSet.types || []).map(type => ({
    type,
    count: rdiList.filter(rdi => rdi.types === type).length
  }));

  const labelStats = Array.from(bcfTopicSet.labels || []).map(label => ({
    label,
    count: rdiList.filter(rdi => rdi.labels === label).length
  }));

  if (totalRDIs === 0) {
    return (
      <Box sx={{ 
        height: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <Typography variant="h6" color="text.secondary">
          No hay datos para mostrar en el dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Dashboard de RDIs
      </Typography>

      <Grid container spacing={2}>
        {/* Resumen General */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen General
              </Typography>
              <Typography variant="h4" color="primary">
                {totalRDIs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de RDIs creados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas por Estado */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Por Estado
              </Typography>
              {statusStats.map(({ status, count }) => (
                <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{status}</Typography>
                  <Typography variant="body2" fontWeight="bold">{count}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas por Tipo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Por Tipo
              </Typography>
              {typeStats.map(({ type, count }) => (
                <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{type}</Typography>
                  <Typography variant="body2" fontWeight="bold">{count}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas por Especialidad */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Por Especialidad
              </Typography>
              <Grid container spacing={1}>
                {labelStats.map(({ label, count }) => (
                  <Grid item xs={6} sm={4} md={3} key={label}>
                    <Box sx={{ 
                      p: 1, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" noWrap>{label}</Typography>
                      <Typography variant="h6" color="primary">{count}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* RDIs Recientes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                RDIs Recientes
              </Typography>
              {rdiList.slice(-5).reverse().map((rdi) => (
                <Box key={rdi.id} sx={{ 
                  p: 1, 
                  mb: 1, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 1 
                }}>
                  <Typography variant="subtitle2">{rdi.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rdi.types} • {rdi.statuses} • {rdi.fecha}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTab;