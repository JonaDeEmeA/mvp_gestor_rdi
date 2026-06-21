'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircleOutline,
  NewReleasesOutlined,
  DeleteOutline,
} from '@mui/icons-material';
import { BIM_COLORS } from '../constants/designTokens';
import { ELEMENT_STATUS } from '../constants/metadataStandards';

const StatusBadge = ({ count, color, label, icon: Icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
    <Icon sx={{ fontSize: 18, color }} />
    <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.secondary }}>
      {label}:
    </Typography>
    <Chip
      label={count}
      size="small"
      sx={{
        backgroundColor: color,
        color: '#FFFFFF',
        fontWeight: 600,
        minWidth: 32,
        fontSize: 12,
      }}
    />
  </Box>
);

const VersionSyncPanel = ({ onSync, summary, loading, ifcVersionId, lastSyncTime }) => {
  const [expanded, setExpanded] = useState(false);

  const hasResults = summary && summary.total > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${BIM_COLORS.neutral.border}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          backgroundColor: BIM_COLORS.primary.soft,
          borderBottom: hasResults ? `1px solid ${BIM_COLORS.neutral.border}` : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SyncIcon sx={{ fontSize: 20, color: BIM_COLORS.primary.main }} />
          <Typography variant="subtitle2" sx={{ color: BIM_COLORS.primary.main, fontWeight: 600 }}>
            Versión IFC
          </Typography>
          {ifcVersionId && (
            <Chip
              label={ifcVersionId}
              size="small"
              sx={{
                backgroundColor: BIM_COLORS.primary.main,
                color: '#FFFFFF',
                fontSize: 11,
                height: 22,
              }}
            />
          )}
        </Box>

        <Button
          variant="contained"
          size="small"
          onClick={onSync}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : <SyncIcon />}
          sx={{
            backgroundColor: BIM_COLORS.primary.main,
            '&:hover': { backgroundColor: BIM_COLORS.primary.active },
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 12,
            minWidth: 100,
            height: 32,
          }}
        >
          {loading ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </Box>

      {/* Resultados */}
      {hasResults && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <StatusBadge
            count={summary.conserved}
            color={BIM_COLORS.accent.main}
            label="Conservados"
            icon={CheckCircleOutline}
          />
          <StatusBadge
            count={summary.newElements}
            color={BIM_COLORS.status.info.main}
            label="Nuevos"
            icon={NewReleasesOutlined}
          />
          <StatusBadge
            count={summary.deleted}
            color={BIM_COLORS.status.warning.main}
            label="Eliminados"
            icon={DeleteOutline}
          />

          <Divider sx={{ my: 1 }} />

          {lastSyncTime && (
            <Typography
              variant="caption"
              sx={{ color: BIM_COLORS.neutral.text.disabled, display: 'block', textAlign: 'right' }}
            >
              Última sync: {lastSyncTime}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default VersionSyncPanel;
