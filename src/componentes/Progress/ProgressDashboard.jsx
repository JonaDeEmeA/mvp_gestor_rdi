import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Grid, Paper, Typography, Button, Chip, Skeleton, Stack,
} from '@mui/material';
import {
  ViewInAr as CubeIcon,
  Assignment as AssignmentIcon,
  Percent as PercentIcon,
  Layers as LayersIcon,
  Timeline as TimelineIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { useProgressManager } from '../../hooks/useProgressManager';
import { PROGRESS_RANGES, getProgressColor } from '../../constants/progressStandards';

const PALETTE = {
  primary: '#1F3A5F',
  green: '#4CAF50',
  amber: '#FFC107',
  blue: '#2196F3',
  grey: '#888888',
  accent: '#2B5DAF',
};

const KpiCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      border: '1px solid',
      borderColor: '#E8ECF0',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 40, height: 40, borderRadius: 1.5,
          bgcolor: (color || PALETTE.primary) + '14',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 20, color: color || PALETTE.primary }} />
      </Box>
      <Typography variant="body2" sx={{ color: '#5F6B7A', fontWeight: 'medium' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1E1E1E', lineHeight: 1.2 }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" sx={{ color: '#9AA4AF' }}>
        {subtitle}
      </Typography>
    )}
  </Paper>
);

const ProgressDashboard = () => {
  const router = useRouter();
  const {
    groups, loading, error,
    getElementsByGroup, getSnapshotsByGroup,
  } = useProgressManager();

  const [kpIs, setKpIs] = useState(null);
  const [recentSnapshots, setRecentSnapshots] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    computeKpis();
  }, [groups, loading]);

  const computeKpis = async () => {
    setLoadingData(true);
    try {
      let totalElements = 0;
      let totalProgress = 0;
      const rangeCounts = { '0': 0, '1-49': 0, '50-99': 0, '100': 0 };
      const allSnapshots = [];

      for (const group of groups) {
        const elements = await getElementsByGroup(group.id);
        const count = elements.length;
        totalElements += count;

        totalProgress += group.progress;

        if (group.progress === 0) rangeCounts['0']++;
        else if (group.progress < 50) rangeCounts['1-49']++;
        else if (group.progress < 100) rangeCounts['50-99']++;
        else rangeCounts['100']++;

        const snapshots = await getSnapshotsByGroup(group.id);
        for (const snap of snapshots) {
          allSnapshots.push({ ...snap, groupName: group.name });
        }
      }

      allSnapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setKpIs({
        totalGroups: groups.length,
        totalElements,
        averageProgress: groups.length > 0 ? Math.round(totalProgress / groups.length) : 0,
        coveredGroups: groups.length > 0 ? groups.filter(g => g.progress > 0).length : 0,
        rangeCounts,
      });
      setRecentSnapshots(allSnapshots.slice(0, 5));
    } catch (err) {
      console.error('Error computing KPIs:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGoToViewer = () => {
    router.push('/viewer?tool=progress');
  };

  const isLoading = loading || loadingData;

  if (isLoading && !kpIs) {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E1E1E', mb: 3 }}>
          Avance de Obra
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!kpIs) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
            Avance de Obra
          </Typography>
          <Box
            sx={{
              px: 1.5, py: 0.5,
              bgcolor: PALETTE.primary + '14',
              border: '1px solid ' + PALETTE.primary + '30',
              borderRadius: 10,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: PALETTE.primary }}>
              {kpIs.totalGroups} grupo{kpIs.totalGroups !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<CubeIcon />}
          onClick={handleGoToViewer}
          sx={{
            bgcolor: PALETTE.primary,
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            px: 3,
            py: 1,
            '&:hover': { bgcolor: PALETTE.accent },
          }}
        >
          Ir al Visor 3D
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#FDECEA', border: '1px solid #FFCDD2', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#D32F2F' }}>{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={LayersIcon}
            title="Grupos"
            value={kpIs.totalGroups}
            subtitle="Grupos de avance creados"
            color={PALETTE.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={AssignmentIcon}
            title="Elementos"
            value={kpIs.totalElements}
            subtitle="Elementos IFC asignados"
            color={PALETTE.blue}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={PercentIcon}
            title="Avance Promedio"
            value={`${kpIs.averageProgress}%`}
            subtitle={`${kpIs.coveredGroups} de ${kpIs.totalGroups} grupos con avance`}
            color={getProgressColor(kpIs.averageProgress)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={TimelineIcon}
            title="Sin Avance"
            value={kpIs.rangeCounts['0']}
            subtitle="Grupos aún en 0%"
            color={PALETTE.grey}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid #E8ECF0',
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1E1E1E', mb: 2 }}>
              Distribución por Rango de Avance
            </Typography>
            <Stack spacing={1.5}>
              {PROGRESS_RANGES.map((range) => {
                const key = range.min === 0 ? '0' : range.min === 100 ? '100' : range.min < 50 ? '1-49' : '50-99';
                const count = kpIs.rangeCounts[key] || 0;
                const pct = kpIs.totalGroups > 0 ? Math.round((count / kpIs.totalGroups) * 100) : 0;
                return (
                  <Box key={key}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: range.color }} />
                        <Typography variant="body2" sx={{ color: '#5F6B7A', fontWeight: 'medium' }}>
                          {range.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
                        {count} ({pct}%)
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%', height: 8, borderRadius: 4,
                        bgcolor: '#F0F2F5', overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${pct}%`, height: '100%', borderRadius: 4,
                          bgcolor: range.color,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid #E8ECF0',
              borderRadius: 2,
              height: '100%',
              maxHeight: 340,
              overflow: 'auto',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1E1E1E', mb: 2 }}>
              Snapshots Recientes
            </Typography>
            {recentSnapshots.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, color: '#9AA4AF' }}>
                <PhotoIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                <Typography variant="body2">No hay snapshots registrados</Typography>
                <Typography variant="caption">Registra avances desde el visor 3D</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {recentSnapshots.map((snap) => (
                  <Box
                    key={snap.id}
                    sx={{
                      p: 1.5,
                      border: '1px solid #E8ECF0',
                      borderRadius: 1.5,
                      bgcolor: '#FAFBFC',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E1E1E', fontSize: '0.85rem' }}>
                        {snap.groupName}
                      </Typography>
                      <Chip
                        label={`${snap.progress}%`}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: getProgressColor(snap.progress) + '20',
                          color: getProgressColor(snap.progress),
                        }}
                      />
                    </Box>
                    {snap.comment && (
                      <Typography variant="caption" sx={{ color: '#5F6B7A', display: 'block', mb: 0.5 }}>
                        {snap.comment.length > 60 ? snap.comment.slice(0, 60) + '...' : snap.comment}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: '#9AA4AF' }}>
                      {new Date(snap.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgressDashboard;
