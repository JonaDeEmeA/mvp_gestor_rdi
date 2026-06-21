import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Box, Paper, Typography, FormControl, Select, MenuItem, Chip, Grid, Skeleton,
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { buildCurveDatasets } from '../../services/progressCalculator';
import { BIM_COLORS } from '../../constants/designTokens';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title,
);

const CHART_COLORS = {
  planned: '#2196F3',
  actual: '#4CAF50',
  plannedFill: 'rgba(33, 150, 243, 0.08)',
  actualFill: 'rgba(76, 175, 80, 0.08)',
  grid: '#E8ECF0',
  text: '#5F6B7A',
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 11 }, padding: 16, usePointStyle: true },
    },
    tooltip: {
      bodyFont: { size: 12 },
      titleFont: { size: 12 },
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
        afterBody: (items) => {
          if (items.length === 2) {
            const diff = items[1].parsed.y - items[0].parsed.y;
            return `Diferencia: ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
          }
          return '';
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: CHART_COLORS.grid },
      ticks: { font: { size: 10 }, color: CHART_COLORS.text },
    },
    y: {
      min: 0,
      max: 100,
      grid: { color: CHART_COLORS.grid },
      ticks: { font: { size: 10 }, color: CHART_COLORS.text, callback: (v) => `${v}%` },
    },
  },
};

const ProgressCurveChart = ({ groups, snapshotsByGroup, loading }) => {
  const [selectedGroupId, setSelectedGroupId] = useState('__total__');

  const dataset = useMemo(() => {
    if (!groups || groups.length === 0) return null;
    const sid = selectedGroupId === '__total__' ? null : selectedGroupId;
    return buildCurveDatasets(groups, snapshotsByGroup || {}, sid);
  }, [groups, snapshotsByGroup, selectedGroupId]);

  const chartData = useMemo(() => {
    if (!dataset || dataset.labels.length === 0) return null;
    return {
      labels: dataset.labels,
      datasets: [
        {
          label: 'Planificado',
          data: dataset.plannedData,
          borderColor: CHART_COLORS.planned,
          backgroundColor: CHART_COLORS.plannedFill,
          borderDash: [6, 3],
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: CHART_COLORS.planned,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Real',
          data: dataset.actualData,
          borderColor: CHART_COLORS.actual,
          backgroundColor: CHART_COLORS.actualFill,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: CHART_COLORS.actual,
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }, [dataset]);

  const diffLabel = dataset
    ? `${dataset.diffPercent >= 0 ? '+' : ''}${dataset.diffPercent.toFixed(1)}%`
    : '—';
  const diffColor = !dataset ? BIM_COLORS.neutral.text.secondary
    : dataset.diffPercent >= 0 ? BIM_COLORS.accent.main : BIM_COLORS.status.error.main;

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BIM_COLORS.neutral.border}`, borderRadius: 2 }}>
        <Skeleton variant="rounded" height={300} />
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BIM_COLORS.neutral.border}`, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon sx={{ fontSize: 20, color: BIM_COLORS.primary.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
            Curva S
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            sx={{ fontSize: '0.8rem', height: 32 }}
          >
            <MenuItem value="__total__" sx={{ fontSize: '0.8rem' }}>Proyecto Total</MenuItem>
            {groups.map((g) => (
              <MenuItem key={g.id} value={g.id} sx={{ fontSize: '0.8rem' }}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {dataset && dataset.labels.length > 0 ? (
        <>
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={options} />
          </Box>
          <Grid container spacing={2} sx={{ mt: 1.5 }}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: CHART_COLORS.text, display: 'block' }}>
                  Planificado
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: CHART_COLORS.planned }}>
                  {dataset.currentPlanned.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: CHART_COLORS.text, display: 'block' }}>
                  Real
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: CHART_COLORS.actual }}>
                  {dataset.currentActual.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: CHART_COLORS.text, display: 'block' }}>
                  Diferencia
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: diffColor }}>
                  {diffLabel}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, color: '#9AA4AF' }}>
          <TimelineIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography variant="body2">No hay datos de curva S</Typography>
          <Typography variant="caption">Define una curva planificada o registra snapshots para ver el gráfico</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProgressCurveChart;
