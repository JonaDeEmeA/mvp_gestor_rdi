'use client';

import React from 'react';
import {
  Typography,
  Box,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircleOutline,
  AssignmentOutlined,
  PhotoOutlined,
  DescriptionOutlined,
  HistoryOutlined,
  InfoOutlined,
  PersonOutlined,
  BusinessOutlined,
  AttachMoneyOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';
import { BIM_COLORS } from '../constants/designTokens';
import FloatingWindow from './FloatingWindow';

const SectionHeader = ({ icon: Icon, label, count, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Icon sx={{ fontSize: 18, color: color || BIM_COLORS.primary.main }} />
    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BIM_COLORS.neutral.text.primary }}>
      {label}
    </Typography>
    {count !== undefined && (
      <Chip
        label={count}
        size="small"
        sx={{ backgroundColor: BIM_COLORS.primary.soft, color: BIM_COLORS.primary.main, fontWeight: 600, fontSize: 11, height: 20, minWidth: 24 }}
      />
    )}
  </Box>
);

const FieldRow = ({ label, value, color }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.3 }}>
    <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontSize: 11 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: color || BIM_COLORS.neutral.text.primary, fontWeight: 500, fontSize: 12 }}>
      {value || '—'}
    </Typography>
  </Box>
);

const StatusChip = ({ status }) => {
  const colorMap = {
    'Abierta': BIM_COLORS.status.error.main,
    'Pendiente': BIM_COLORS.status.warning.main,
    'En progreso': BIM_COLORS.status.info.main,
    'En revisión': BIM_COLORS.status.info.main,
    'Resuelta': BIM_COLORS.accent.main,
    'Cerrada': BIM_COLORS.neutral.text.disabled,
  };
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: colorMap[status] || BIM_COLORS.neutral.border,
        color: '#FFFFFF',
        fontWeight: 500,
        fontSize: 10,
        height: 20,
      }}
    />
  );
};

const ProgressBar = ({ value, label }) => {
  const color = value >= 100 ? BIM_COLORS.accent.main
    : value >= 50 ? BIM_COLORS.status.info.main
    : value >= 1 ? BIM_COLORS.status.warning.main
    : BIM_COLORS.neutral.text.disabled;
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
        <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontSize: 10 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11, color }}>
          {value}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: BIM_COLORS.neutral.border,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
};

const HistoryItem = ({ entry }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
    <Box sx={{ minWidth: 8, mt: 0.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: BIM_COLORS.primary.main, opacity: 0.5 }} />
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ fontSize: 11, color: BIM_COLORS.neutral.text.primary, display: 'block' }}>
        {entry.description || entry.action}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: 10, color: BIM_COLORS.neutral.text.disabled }}>
        {entry.author ? `${entry.author} · ` : ''}{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
      </Typography>
    </Box>
  </Box>
);

const ElementDashboard = ({ open, onClose, globalId, metadataService, selectedGuid }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const activeGlobalId = globalId || selectedGuid;

  React.useEffect(() => {
    if (!metadataService || !activeGlobalId) {
      setData(null);
      return;
    }
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const md = await metadataService.getByGlobalId(activeGlobalId);
        if (!cancelled) setData(md || null);
      } catch (err) {
        console.error('[ElementDashboard] Error:', err);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [metadataService, activeGlobalId]);

  const renderContent = () => {
    if (!activeGlobalId) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, opacity: 0.5 }}>
          <InfoOutlined sx={{ fontSize: 40, color: BIM_COLORS.neutral.text.disabled, mb: 1 }} />
          <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.secondary }}>
            Selecciona un elemento 3D
          </Typography>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: BIM_COLORS.primary.main }} />
        </Box>
      );
    }

    if (!data) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, opacity: 0.6 }}>
          <InfoOutlined sx={{ fontSize: 32, color: BIM_COLORS.neutral.text.disabled, mb: 1 }} />
          <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.secondary, textAlign: 'center' }}>
            Sin metadatos para este elemento
          </Typography>
          <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled, mt: 0.5 }}>
            {activeGlobalId}
          </Typography>
        </Box>
      );
    }

    const classification = data.classification || {};
    const contractual = data.contractual || {};
    const production = data.production || {};
    const economic = data.economic || {};
    const issues = data.management?.issues || [];
    const photos = data.management?.photos || [];
    const documents = data.management?.documents || [];
    const history = (data.management?.history || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const openIssues = issues.filter((i) => i.status === 'Abierta' || i.status === 'Pendiente').length;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>

        {/* GlobalId header */}
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled, fontSize: 10, wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {data.globalId}
          </Typography>
        </Box>

        {/* Classification */}
        {(classification.chapter || classification.specialty) && (
          <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, py: 0 }}>
              <SectionHeader icon={InfoOutlined} label="Clasificación" color={BIM_COLORS.primary.main} />
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 0.5 }}>
              <FieldRow label="Capítulo" value={classification.chapter} />
              <FieldRow label="Subcapítulo" value={classification.subchapter} />
              <FieldRow label="Especialidad" value={classification.specialty} />
              <FieldRow label="Disciplina" value={classification.discipline} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Contractual */}
        {(contractual.responsible || contractual.company) && (
          <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, py: 0 }}>
              <SectionHeader icon={PersonOutlined} label="Contractual" />
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 0.5 }}>
              <FieldRow label="Responsable" value={contractual.responsible} />
              <FieldRow label="Empresa" value={contractual.company} />
              <FieldRow label="Contrato" value={contractual.contract} />
              <FieldRow label="Ruta crítica" value={contractual.isCriticalPath ? 'Sí' : 'No'} color={contractual.isCriticalPath ? BIM_COLORS.status.error.main : undefined} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Production */}
        <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, py: 0 }}>
            <SectionHeader icon={TrendingUpOutlined} label="Avance" />
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 0.5 }}>
            <ProgressBar value={production.progress || 0} label="Avance real" />
            <ProgressBar value={production.plannedProgress || 0} label="Avance planificado" />
            <FieldRow label="Peso" value={production.weight ? `${production.weight} ${production.weightUnit || ''}` : '—'} />
            <FieldRow label="Cantidad" value={production.quantity ? `${production.quantity} ${production.unit || ''}` : '—'} />
          </AccordionDetails>
        </Accordion>

        {/* Economic */}
        {(economic.cost || economic.budget) && (
          <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, py: 0 }}>
              <SectionHeader icon={AttachMoneyOutlined} label="Económico" />
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 0.5 }}>
              <FieldRow label="Costo" value={economic.cost ? `$${economic.cost.toLocaleString()}` : '—'} />
              <FieldRow label="Presupuesto" value={economic.budget ? `$${economic.budget.toLocaleString()}` : '—'} />
              <FieldRow label="HH" value={economic.manHours ? `${economic.manHours} hrs` : '—'} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Issues */}
        <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, py: 0 }}>
            <SectionHeader icon={WarningAmberOutlined} label="Incidencias" count={issues.length} color={openIssues > 0 ? BIM_COLORS.status.warning.main : BIM_COLORS.accent.main} />
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 0.5 }}>
            {issues.length === 0 ? (
              <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled, fontStyle: 'italic' }}>
                Sin incidencias
              </Typography>
            ) : (
              issues.slice(0, 5).map((issue) => (
                <Box key={issue.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <StatusChip status={issue.status} />
                  <Typography variant="caption" sx={{ flex: 1, color: BIM_COLORS.neutral.text.primary, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.title}
                  </Typography>
                </Box>
              ))
            )}
            {issues.length > 5 && (
              <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled, display: 'block', textAlign: 'right', mt: 0.5 }}>
                +{issues.length - 5} más
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Photos count */}
        {photos.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <PhotoOutlined sx={{ fontSize: 16, color: BIM_COLORS.primary.main }} />
            <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary }}>
              {photos.length} fotografía{photos.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Documents count */}
        {documents.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <DescriptionOutlined sx={{ fontSize: 16, color: BIM_COLORS.primary.main }} />
            <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary }}>
              {documents.length} documento{documents.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Sync status */}
        {data.syncStatus && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, mt: 0.5 }}>
            <AssignmentOutlined sx={{ fontSize: 14, color: BIM_COLORS.neutral.text.disabled }} />
            <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled, fontSize: 10 }}>
              {data.syncStatus === 'conserved' ? 'Sincronizado' : data.syncStatus === 'new' ? 'Nuevo' : 'Eliminado del modelo'}
              {data.ifcVersionId ? ` · v${data.ifcVersionId}` : ''}
            </Typography>
          </Box>
        )}

        {/* History */}
        {history.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, py: 0 }}>
                <SectionHeader icon={HistoryOutlined} label="Historial" count={history.length} />
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 0.5, maxHeight: 160, overflowY: 'auto' }}>
                {history.slice(0, 10).map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} />
                ))}
                {history.length > 10 && (
                  <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled, display: 'block', textAlign: 'right' }}>
                    +{history.length - 10} más
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Box>
    );
  };

  return (
    <FloatingWindow
      open={open}
      onClose={onClose}
      title={activeGlobalId ? `Elemento ${activeGlobalId.slice(0, 8)}...` : 'Dashboard BIM'}
      width="340px"
      height="520px"
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </Box>
      </Box>
    </FloatingWindow>
  );
};

export default ElementDashboard;
