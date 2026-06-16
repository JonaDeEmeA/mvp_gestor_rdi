import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import { useProgressManager } from '../../hooks/useProgressManager';
import ProgressGroupList from './ProgressGroupList';
import ProgressGroupForm from './ProgressGroupForm';
import ProgressGroupDetail from './ProgressGroupDetail';
import CloseButton from '../CloseButton';
import { BIM_COLORS } from '../../constants/designTokens';

const ProgressPanel = ({ selectedGuid, selectedElementType = '', onHighlightByGuids, onClose, showBIMColors = false, onApplyBIMColors, onClearBIMColors, bimDataRef }) => {
  const {
    groups, loading, error,
    createGroup, deleteGroup, updateGroup,
    addElementToGroup, removeElementFromGroup,
    getElementsByGroup, getGroupsByElement,
  } = useProgressManager();

  const [view, setView] = useState('list');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupElements, setGroupElements] = useState({});
  const [elementCounts, setElementCounts] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [duplicateMessage, setDuplicateMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    ifcGuid: null,
    targetGroupId: null,
    existingGroups: [],
  });

  const loadElementCounts = useCallback(async () => {
    const counts = {};
    for (const group of groups) {
      const elements = await getElementsByGroup(group.id);
      counts[group.id] = elements.length;
    }
    setElementCounts(counts);
  }, [groups, getElementsByGroup]);

  useEffect(() => {
    if (bimDataRef) {
      bimDataRef.current = { groups, getElementsByGroup };
    }
  });

  useEffect(() => {
    if (groups.length > 0 && showBIMColors) {
      loadElementCounts();
      if (onApplyBIMColors) {
        onApplyBIMColors(groups, getElementsByGroup);
      }
    }
  }, [groups, loadElementCounts, onApplyBIMColors, getElementsByGroup, showBIMColors]);

  useEffect(() => {
    if (groups.length === 0 && onClearBIMColors) {
      onClearBIMColors();
    }
  }, [groups.length, onClearBIMColors]);

  const loadGroupElements = useCallback(async (groupId) => {
    const elements = await getElementsByGroup(groupId);
    setGroupElements((prev) => ({ ...prev, [groupId]: elements }));
    return elements;
  }, [getElementsByGroup]);

  const handleHighlightGroup = async (group) => {
    const elements = await getElementsByGroup(group.id);
    const guids = elements.map((el) => el.ifcGuid);
    if (onHighlightByGuids && guids.length > 0) {
      onHighlightByGuids(guids);
    }
  };

  const handleViewDetail = async (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    setSelectedGroup(group);
    setActiveGroupId(group.id);
    setView('detail');
    setDuplicateMessage(null);
    await loadGroupElements(group.id);
  };

  const handleBack = () => {
    setView('list');
    setSelectedGroup(null);
    setActiveGroupId(null);
    setDuplicateMessage(null);
    if (onHighlightByGuids) {
      onHighlightByGuids([]);
    }
  };

  const handleCreateGroup = async (data) => {
    await createGroup(data);
    setView('list');
  };

  const handleDeleteGroup = async (groupId) => {
    if (onClearBIMColors) {
      onClearBIMColors();
    }
    await deleteGroup(groupId);
    if (selectedGroup?.id === groupId) {
      handleBack();
    }
  };

  const handleAssignElement = async (groupId, ifcGuid) => {
    const currentElements = groupElements[groupId] || [];
    if (currentElements.some((el) => el.ifcGuid === ifcGuid)) {
      setDuplicateMessage('Este elemento ya está asignado a este grupo.');
      setTimeout(() => setDuplicateMessage(null), 3000);
      return;
    }

    const groupsOfElement = await getGroupsByElement(ifcGuid);
    const otherGroups = groupsOfElement.filter((g) => g.id !== groupId);
    if (otherGroups.length > 0) {
      setConfirmDialog({
        open: true,
        ifcGuid,
        targetGroupId: groupId,
        existingGroups: otherGroups,
      });
      return;
    }

    const elementType = ifcGuid === selectedGuid ? selectedElementType : '';
    await addElementToGroup(groupId, ifcGuid, elementType);
    await loadGroupElements(groupId);
    await loadElementCounts();
    if (showBIMColors && onApplyBIMColors) {
      onApplyBIMColors(groups, getElementsByGroup);
    }
  };

  const handleConfirmAssign = async () => {
    const { targetGroupId, ifcGuid } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, open: false }));
    const elementType = ifcGuid === selectedGuid ? selectedElementType : '';
    await addElementToGroup(targetGroupId, ifcGuid, elementType);
    await loadGroupElements(targetGroupId);
    await loadElementCounts();
    if (showBIMColors && onApplyBIMColors) {
      onApplyBIMColors(groups, getElementsByGroup);
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const handleRemoveElement = async (groupId, ifcGuid) => {
    await removeElementFromGroup(groupId, ifcGuid);
    await loadGroupElements(groupId);
    await loadElementCounts();
    if (showBIMColors && onApplyBIMColors) {
      onApplyBIMColors(groups, getElementsByGroup);
    }
  };

  const handleGroupProgressUpdate = async (groupId, progress) => {
    await updateGroup(groupId, { progress });
    if (selectedGroup?.id === groupId) {
      setSelectedGroup((prev) => prev ? { ...prev, progress } : prev);
    }
    await loadElementCounts();
    if (showBIMColors && onApplyBIMColors) {
      onApplyBIMColors(groups, getElementsByGroup);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: BIM_COLORS.neutral.background.main,
        pointerEvents: 'auto',
        borderRadius: 0,
        borderLeft: { sm: `1px solid ${BIM_COLORS.neutral.border}` },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          bgcolor: BIM_COLORS.primary.main,
          color: 'white',
          p: 2,
          pr: 1,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
          Avance de Obra
        </Typography>
        <CloseButton onClose={onClose} tooltip="Cerrar Avance de Obra" />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 1.5, mt: 1.5 }}>{error}</Alert>
      )}

      {duplicateMessage && (
        <Alert severity="warning" sx={{ mx: 1.5, mt: 1.5 }}>{duplicateMessage}</Alert>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {view === 'form' && (
          <ProgressGroupForm
            show={true}
            onCancel={handleBack}
            onSave={handleCreateGroup}
            existingGroups={groups}
          />
        )}

        {view === 'list' && (
          <ProgressGroupList
            groups={groups}
            elementCounts={elementCounts}
            activeGroupId={activeGroupId}
            onHighlightGroup={handleHighlightGroup}
            onViewDetail={handleViewDetail}
            onAddGroup={() => setView('form')}
            onDeleteGroup={handleDeleteGroup}
          />
        )}

        {view === 'detail' && selectedGroup && (
          <ProgressGroupDetail
            group={selectedGroup}
            elements={groupElements[selectedGroup.id] || []}
            selectedGuid={selectedGuid}
            onBack={handleBack}
            onAssignElement={handleAssignElement}
            onRemoveElement={handleRemoveElement}
            onGroupProgressUpdate={handleGroupProgressUpdate}
            onHighlightByGuids={onHighlightByGuids}
          />
        )}
      </Box>

      <Dialog open={confirmDialog.open} onClose={handleCancelDialog}>
        <DialogTitle>Elemento ya asignado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            El elemento <strong>{confirmDialog.ifcGuid?.slice(0, 25)}...</strong> ya existe en el
            grupo{confirmDialog.existingGroups.length > 1 ? 's' : ''}:{' '}
            {confirmDialog.existingGroups.map((g) => g.name).join(', ')}.
            {'\n'}¿Deseas asignarlo también a este grupo?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialog} sx={{ color: BIM_COLORS.neutral.text.secondary }}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAssign}
            variant="contained"
            autoFocus
            sx={{
              bgcolor: BIM_COLORS.accent.main,
              '&:hover': { bgcolor: BIM_COLORS.accent.active }
            }}
          >
            Sí, continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProgressPanel;
