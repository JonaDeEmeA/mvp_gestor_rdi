import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, LinearProgress, Chip, List, ListItemButton,
  ListItemText, Button, IconButton, Paper, Tabs, Tab, Tooltip,
} from '@mui/material';
import { ArrowBack as BackIcon, Delete as DeleteIcon, Add as AddIcon, Warning as WarningIcon } from '@mui/icons-material';
import { getProgressColor, getWeightUnitLabel, formatWeight } from '../../constants/progressStandards';
import { calculateCompliance } from '../../services/progressCalculator';
import { BIM_COLORS } from '../../constants/designTokens';
import { useProgressSnapshots } from '../../hooks/useProgressSnapshots';
import { useProgressPhotos } from '../../hooks/useProgressPhotos';
import TabPanel, { a11yProps } from '../TabTools/TabPanel';
import SnapshotForm from './SnapshotForm';
import SnapshotHistoryPanel from './SnapshotHistoryPanel';

const ProgressGroupDetail = ({ group, elements, selectedGuid, onBack, onAssignElement, onRemoveElement, onGroupProgressUpdate, onHighlightByGuids }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [expandedSnapshotId, setExpandedSnapshotId] = useState(null);
  const [photosBySnapshotId, setPhotosBySnapshotId] = useState({});
  const photosLoadedRef = useRef({});

  const color = getProgressColor(group.progress);
  const alreadyAssigned = selectedGuid && elements.some((el) => el.ifcGuid === selectedGuid);

  const {
    snapshots,
    loading: snapshotsLoading,
    error: snapshotsError,
    loadSnapshots,
    addSnapshot,
  } = useProgressSnapshots(group.id, onGroupProgressUpdate);

  const {
    loadPhotos,
    addPhoto: addPhotoToSnapshot,
    deletePhoto: deletePhotoFromSnapshot,
  } = useProgressPhotos();

  useEffect(() => {
    if (group.id) {
      loadSnapshots(group.id);
    }
  }, [group.id, loadSnapshots]);

  const handleSaveSnapshot = useCallback(async (progress, comment) => {
    await addSnapshot(progress, comment);
    setShowForm(false);
  }, [addSnapshot]);

  const handleToggleExpand = useCallback(async (snapshotId) => {
    if (expandedSnapshotId === snapshotId) {
      setExpandedSnapshotId(null);
      return;
    }
    setExpandedSnapshotId(snapshotId);
    if (!photosLoadedRef.current[snapshotId]) {
      const photos = await loadPhotos(snapshotId);
      setPhotosBySnapshotId((prev) => ({ ...prev, [snapshotId]: photos }));
      photosLoadedRef.current[snapshotId] = true;
    }
  }, [expandedSnapshotId, loadPhotos]);

  const handleAddPhoto = useCallback(async (snapshotId, file, caption) => {
    await addPhotoToSnapshot(snapshotId, file, caption);
    const updatedPhotos = await loadPhotos(snapshotId);
    setPhotosBySnapshotId((prev) => ({ ...prev, [snapshotId]: updatedPhotos }));
  }, [addPhotoToSnapshot, loadPhotos]);

  const handleDeletePhoto = useCallback(async (snapshotId, photoId) => {
    await deletePhotoFromSnapshot(photoId);
    const updatedPhotos = await loadPhotos(snapshotId);
    setPhotosBySnapshotId((prev) => ({ ...prev, [snapshotId]: updatedPhotos }));
  }, [deletePhotoFromSnapshot, loadPhotos]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={onBack} sx={{ color: BIM_COLORS.primary.main }}>
          <BackIcon />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1, color: BIM_COLORS.neutral.text.primary }}>
          {group.name}
        </Typography>
        {group.isCritical && (
          <Tooltip title="Grupo crítico">
            <WarningIcon sx={{ fontSize: 18, color: BIM_COLORS.status.warning.main }} />
          </Tooltip>
        )}
        <Chip
          label={`${Number(group.progress).toFixed(1)}%`}
          size="small"
          sx={{
            fontWeight: 'bold',
            bgcolor: color,
            color: '#fff',
          }}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={group.progress}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 1.5,
          bgcolor: 'rgba(0,0,0,0.08)',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />

      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip
          label={formatWeight(group.weight ?? 1.0, group.weightUnit)}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.65rem', height: 20, borderColor: BIM_COLORS.neutral.border, color: BIM_COLORS.neutral.text.secondary }}
        />
        <Chip
          label={getWeightUnitLabel(group.weightUnit)}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.65rem', height: 20, borderColor: BIM_COLORS.neutral.border, color: BIM_COLORS.neutral.text.secondary }}
        />
        {group.plannedProgress > 0 && (
          <Chip
            label={`Meta: ${Number(group.plannedProgress).toFixed(1)}%`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.65rem', height: 20, borderColor: BIM_COLORS.neutral.border, color: BIM_COLORS.neutral.text.secondary }}
          />
        )}
        {group.plannedProgress > 0 && (
          <Chip
            label={`Cumplimiento: ${calculateCompliance(group.progress, group.plannedProgress).toFixed(1)}%`}
            size="small"
            sx={{
              fontSize: '0.65rem',
              height: 20,
              fontWeight: 'bold',
              bgcolor: group.progress >= group.plannedProgress ? BIM_COLORS.accent.soft : BIM_COLORS.status.warning.soft,
              color: group.progress >= group.plannedProgress ? BIM_COLORS.accent.main : BIM_COLORS.status.warning.main,
            }}
          />
        )}
      </Box>

      {group.description && (
        <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.secondary, mb: 1.5 }}>
          {group.description}
        </Typography>
      )}

      <Tabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        variant="fullWidth"
        textColor="inherit"
        sx={{
          minHeight: 36,
          mb: 1.5,
          borderBottom: `1px solid ${BIM_COLORS.neutral.border}`,
          '& .MuiTabs-indicator': {
            backgroundColor: BIM_COLORS.accent.main,
            height: 3,
          },
          '& .MuiTab-root': {
            minHeight: 36,
            py: 0.5,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'none',
            color: BIM_COLORS.neutral.text.secondary,
            '&.Mui-selected': {
              color: BIM_COLORS.primary.main,
            },
          },
        }}
      >
        <Tab label={`Elementos (${elements.length})`} {...a11yProps(0)} />
        <Tab label={`Avance (${snapshots.length})`} {...a11yProps(1)} />
      </Tabs>

      <TabPanel value={tabValue} index={0} sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        <Box>
          {selectedGuid && (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 1.5,
                bgcolor: alreadyAssigned ? BIM_COLORS.accent.soft : BIM_COLORS.primary.soft,
                borderColor: alreadyAssigned ? BIM_COLORS.accent.main : BIM_COLORS.primary.active,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: BIM_COLORS.neutral.text.primary }}>
                {alreadyAssigned ? '✓ Elemento ya asignado a este grupo:' : 'Elemento seleccionado en 3D:'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all', flex: 1, color: BIM_COLORS.neutral.text.secondary }}>
                  {selectedGuid}
                </Typography>
                {!alreadyAssigned && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onAssignElement(group.id, selectedGuid)}
                    sx={{
                      fontSize: '0.65rem',
                      whiteSpace: 'nowrap',
                      bgcolor: BIM_COLORS.accent.main,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      '&:hover': { bgcolor: BIM_COLORS.accent.active }
                    }}
                  >
                    Asignar
                  </Button>
                )}
              </Box>
            </Paper>
          )}

          {elements.length === 0 ? (
            <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.disabled, textAlign: 'center', py: 3 }}>
              Este grupo no tiene elementos asignados. Selecciona un elemento 3D y presiona &quot;Asignar&quot; para agregarlo.
            </Typography>
          ) : (
            <List dense disablePadding>
              {elements.map((el) => (
                <ListItemButton
                  key={el.id}
                  onClick={() => onHighlightByGuids?.([el.ifcGuid])}
                  sx={{
                    borderRadius: 1,
                    mb: 0.8,
                    border: `1px solid ${BIM_COLORS.neutral.border}`,
                    bgcolor: 'white',
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: BIM_COLORS.primary.main,
                      bgcolor: BIM_COLORS.primary.soft,
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      el.elementType
                        ? <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.78rem', color: BIM_COLORS.neutral.text.primary }}>
                            {el.elementType}
                          </Typography>
                        : null
                    }
                    secondary={
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: BIM_COLORS.neutral.text.secondary }}>
                        {el.ifcGuid}
                      </Typography>
                    }
                  />
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onRemoveElement(group.id, el.ifcGuid); }}
                    sx={{ color: BIM_COLORS.status.error.main, ml: 1 }}
                    title="Quitar"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1} sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        <Box>
          <Button
            size="small"
            variant={showForm ? 'outlined' : 'contained'}
            startIcon={<AddIcon />}
            onClick={() => setShowForm((prev) => !prev)}
            sx={{
              fontSize: '0.7rem',
              textTransform: 'none',
              fontWeight: 'bold',
              mb: 1.5,
              ...(showForm
                ? { borderColor: BIM_COLORS.neutral.border, color: BIM_COLORS.neutral.text.secondary }
                : { bgcolor: BIM_COLORS.accent.main, '&:hover': { bgcolor: BIM_COLORS.accent.active } }),
            }}
          >
            {showForm ? 'Cancelar' : 'Registrar Avance'}
          </Button>

          {showForm && (
            <SnapshotForm
              currentProgress={group.progress}
              onSave={handleSaveSnapshot}
              onCancel={() => setShowForm(false)}
            />
          )}

          <SnapshotHistoryPanel
            snapshots={snapshots}
            loading={snapshotsLoading}
            error={snapshotsError}
            expandedSnapshotId={expandedSnapshotId}
            onToggleExpand={handleToggleExpand}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            photosBySnapshotId={photosBySnapshotId}
          />
        </Box>
      </TabPanel>
    </Box>
  );
};

export default ProgressGroupDetail;
