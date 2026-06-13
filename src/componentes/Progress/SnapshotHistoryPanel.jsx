import { useState } from 'react';
import {
  Box, Typography, List, ListItem, Chip, CircularProgress, Alert, IconButton, Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon, ExpandLess as CollapseIcon, PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getProgressColor } from '../../constants/progressStandards';
import { BIM_COLORS } from '../../constants/designTokens';
import PhotoCapture from './PhotoCapture';

const SnapshotItem = ({ snapshot, isFirst, isLast, onToggleExpand, expanded, onAddPhoto, onDeletePhoto, photos }) => {
  const color = getProgressColor(snapshot.progress);
  const hasPhotos = photos && photos.length > 0;

  return (
    <Box>
      <ListItem
        sx={{
          borderRadius: 1,
          mb: 0,
          border: `1px solid ${BIM_COLORS.neutral.border}`,
          bgcolor: 'white',
          flexDirection: 'column',
          alignItems: 'flex-start',
          p: 1.5,
          cursor: 'pointer',
          transition: 'all 0.15s',
          '&:hover': {
            borderColor: BIM_COLORS.primary.main,
            bgcolor: BIM_COLORS.primary.soft,
          },
        }}
        onClick={() => onToggleExpand(snapshot.id)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, width: '100%' }}>
          <Chip
            label={`${snapshot.progress}%`}
            size="small"
            sx={{
              fontWeight: 'bold',
              bgcolor: color,
              color: '#fff',
              minWidth: 48,
            }}
          />
          <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, fontSize: '0.65rem' }}>
            {snapshot.createdAt
              ? format(new Date(snapshot.createdAt), 'dd/MM/yyyy HH:mm')
              : ''}
          </Typography>
          {hasPhotos && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 0.5 }}>
              <PhotoIcon sx={{ fontSize: 12, color: BIM_COLORS.accent.main }} />
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: BIM_COLORS.accent.main }}>
                {photos.length}
              </Typography>
            </Box>
          )}
          {isFirst && (
            <Chip
              label="Último"
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.6rem',
                height: 20,
                borderColor: BIM_COLORS.accent.main,
                color: BIM_COLORS.accent.main,
                ml: 'auto',
              }}
            />
          )}
          <IconButton
            size="small"
            sx={{ ml: 'auto', color: BIM_COLORS.neutral.text.disabled, p: 0.3 }}
          >
            {expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
          </IconButton>
        </Box>

        {snapshot.comment && (
          <Typography
            variant="body2"
            sx={{
              color: BIM_COLORS.neutral.text.secondary,
              fontSize: '0.78rem',
              wordBreak: 'break-word',
              width: '100%',
            }}
          >
            {snapshot.comment}
          </Typography>
        )}

        {snapshot.createdBy && (
          <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.disabled, fontSize: '0.6rem', mt: 0.5 }}>
            {snapshot.createdBy}
          </Typography>
        )}
      </ListItem>

      <Collapse in={expanded} timeout="auto">
        <Box
          sx={{
            p: 1.5,
            pt: 1,
            borderLeft: `2px solid ${BIM_COLORS.neutral.border}`,
            borderRight: `1px solid ${BIM_COLORS.neutral.border}`,
            borderBottom: `1px solid ${BIM_COLORS.neutral.border}`,
            borderBottomLeftRadius: 1,
            borderBottomRightRadius: 1,
            mb: isLast ? 0 : 0.8,
            bgcolor: BIM_COLORS.neutral.background.secondary,
          }}
        >
          <PhotoCapture
            existingPhotos={photos || []}
            onAddPhoto={(file, caption) => onAddPhoto(snapshot.id, file, caption)}
            onDeletePhoto={(photoId) => onDeletePhoto(snapshot.id, photoId)}
          />
        </Box>
      </Collapse>

      {!isLast && !expanded && (
        <Box
          sx={{
            width: 2,
            height: 12,
            bgcolor: BIM_COLORS.neutral.border,
            ml: '24px',
            my: 0.3,
          }}
        />
      )}
    </Box>
  );
};

const SnapshotHistoryPanel = ({ snapshots, loading, error, expandedSnapshotId, onToggleExpand, onAddPhoto, onDeletePhoto, photosBySnapshotId }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>;
  }

  if (snapshots.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.disabled, textAlign: 'center', py: 2 }}>
        No hay avances registrados aún. Usa el formulario superior para registrar el primer avance.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: BIM_COLORS.neutral.text.primary, mb: 1, display: 'block' }}>
        Historial de Avances ({snapshots.length})
      </Typography>

      <List dense disablePadding>
        {snapshots.map((snapshot, index) => (
          <SnapshotItem
            key={snapshot.id}
            snapshot={snapshot}
            isFirst={index === 0}
            isLast={index === snapshots.length - 1}
            onToggleExpand={onToggleExpand}
            expanded={expandedSnapshotId === snapshot.id}
            onAddPhoto={onAddPhoto}
            onDeletePhoto={onDeletePhoto}
            photos={photosBySnapshotId?.[snapshot.id]}
          />
        ))}
      </List>
    </Box>
  );
};

export default SnapshotHistoryPanel;
