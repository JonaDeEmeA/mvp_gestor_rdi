// src/componentes/Dashboard/RDIChartsPanel.jsx
// Panel de gráficos de estadísticas de RDIs para el Dashboard de proyectos.
// Componente de presentación puro: recibe `stats` como prop, no tiene estado propio.
// Usa react-chartjs-2 con registro explícito de los elementos necesarios de Chart.js.

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Box, Grid, Paper, Typography, Skeleton } from '@mui/material';
import {
  DonutLarge as DonutIcon,
  BarChart as BarIcon,
  Timeline as LineIcon,
} from '@mui/icons-material';

// Registro único de componentes Chart.js (sin efectos secundarios en cada render)
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title
);

// ─── Paleta del proyecto ──────────────────────────────────────────────────────
const PALETTE = {
  primary: '#1F3A5F',
  green: '#4CAF50',
  amber: '#FFA726',
  red: '#EF5350',
  teal: '#26A69A',
  purple: '#7E57C2',
  blue: '#42A5F5',
  accent: '#2B5DAF',
};

const STATUS_COLORS = [PALETTE.green, PALETTE.amber, PALETTE.red, PALETTE.blue, PALETTE.purple, PALETTE.teal];
const TYPE_COLORS = [PALETTE.primary, PALETTE.accent, PALETTE.teal, PALETTE.amber, PALETTE.purple, PALETTE.red];

// Opciones comunes reutilizables
const BASE_LEGEND_OPTS = {
  position: 'bottom',
  labels: { font: { size: 11 }, padding: 12, usePointStyle: true },
};

const BASE_TOOLTIP = { bodyFont: { size: 12 }, titleFont: { size: 12 } };

// ─── Sub-componente: Tarjeta de gráfico ──────────────────────────────────────
const ChartCard = ({ icon: Icon, title, children }) => (
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
      gap: 2,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    }}
  >
    {/* Header de la tarjeta */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon sx={{ fontSize: 20, color: PALETTE.primary }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
        {title}
      </Typography>
    </Box>
    {/* Gráfico */}
    <Box sx={{ flex: 1, position: 'relative', minHeight: 200 }}>
      {children}
    </Box>
  </Paper>
);

// ─── Sub-componente: Estado vacío ────────────────────────────────────────────
const EmptyChartState = ({ message = 'Sin datos disponibles' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 160,
      gap: 1,
      color: '#9AA4AF',
    }}
  >
    <Typography variant="h3">📊</Typography>
    <Typography variant="body2" sx={{ textAlign: 'center' }}>
      {message}
    </Typography>
  </Box>
);

// ─── Gráfico 1: Doughnut — Por Estado ────────────────────────────────────────
const StatusDoughnut = ({ byStatus }) => {
  const labels = Object.keys(byStatus);
  const data = Object.values(byStatus);

  if (labels.length === 0) {
    return <EmptyChartState message="Crea RDIs para ver la distribución por estado" />;
  }

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data,
          backgroundColor: STATUS_COLORS.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverBorderColor: '#fff',
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: BASE_LEGEND_OPTS,
          tooltip: BASE_TOOLTIP,
        },
      }}
    />
  );
};

// ─── Gráfico 2: Bar — Por Tipo ────────────────────────────────────────────────
const TypeBar = ({ byType }) => {
  const labels = Object.keys(byType);
  const data = Object.values(byType);

  if (labels.length === 0) {
    return <EmptyChartState message="Crea RDIs para ver la distribución por tipo" />;
  }

  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: 'Cantidad',
          data,
          backgroundColor: TYPE_COLORS.slice(0, labels.length).map(c => c + 'CC'),
          borderColor: TYPE_COLORS.slice(0, labels.length),
          borderWidth: 1.5,
          borderRadius: 4,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: BASE_TOOLTIP,
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { color: '#F0F2F5' },
          },
          x: {
            ticks: { font: { size: 10 } },
            grid: { display: false },
          },
        },
      }}
    />
  );
};

// ─── Gráfico 3: Line — Evolución temporal ────────────────────────────────────
const MonthlyLine = ({ byMonth }) => {
  const hasData = byMonth.some(m => m.count > 0);

  if (!hasData) {
    return <EmptyChartState message="No hay RDIs registradas en los últimos 6 meses" />;
  }

  return (
    <Line
      data={{
        labels: byMonth.map(m => m.label),
        datasets: [{
          label: 'RDIs creadas',
          data: byMonth.map(m => m.count),
          borderColor: PALETTE.primary,
          backgroundColor: PALETTE.primary + '18',
          borderWidth: 2,
          pointBackgroundColor: PALETTE.primary,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.35,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: BASE_TOOLTIP,
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { color: '#F0F2F5' },
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false },
          },
        },
      }}
    />
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
/**
 * RDIChartsPanel
 * @param {Object}  stats    - Métricas calculadas por useRDIStats
 * @param {boolean} loading  - Mostrar skeletons mientras carga
 */
export default function RDIChartsPanel({ stats, loading }) {
  // ─── Estado de carga ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map(i => (
          <Grid item xs={12} md={4} key={i}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
        ))}
      </Grid>
    );
  }

  // ─── Sin datos ─────────────────────────────────────────────────────────────
  if (!stats) return null;

  const { total, byStatus, byType, byMonth } = stats;

  return (
    <Box>
      {/* Resumen numérico */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E1E1E' }}>
          Métricas del Proyecto
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            bgcolor: PALETTE.primary + '14',
            border: `1px solid ${PALETTE.primary}30`,
            borderRadius: 10,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: PALETTE.primary }}>
            {total} RDI{total !== 1 ? 's' : ''} en total
          </Typography>
        </Box>
      </Box>

      {/* Grid de gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico 1: Distribución por Estado */}
        <Grid item xs={12} md={4}>
          <ChartCard icon={DonutIcon} title="Por Estado">
            <StatusDoughnut byStatus={byStatus} />
          </ChartCard>
        </Grid>

        {/* Gráfico 2: Distribución por Tipo */}
        <Grid item xs={12} md={4}>
          <ChartCard icon={BarIcon} title="Por Tipo de Incidencia">
            <TypeBar byType={byType} />
          </ChartCard>
        </Grid>

        {/* Gráfico 3: Evolución temporal */}
        <Grid item xs={12} md={4}>
          <ChartCard icon={LineIcon} title="Evolución (últimos 6 meses)">
            <MonthlyLine byMonth={byMonth} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
