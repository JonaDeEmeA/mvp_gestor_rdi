import { useState, useMemo } from 'react';
import {
  Box, Typography, List, ListItem, ListItemButton,
  ListItemText, LinearProgress, IconButton, Chip, Collapse, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon,
  ExpandLess, ExpandMore, Warning as WarningIcon,
} from '@mui/icons-material';
import { getProgressColor, formatWeight } from '../../constants/progressStandards';
import { buildGroupTree } from '../../services/progressCalculator';
import { BIM_COLORS } from '../../constants/designTokens';

const GroupListItem = ({ group, elementCount, isActive, onHighlight, onViewDetail, onDelete, depth = 0 }) => {
  const color = getProgressColor(group.progress);
  const [open, setOpen] = useState(false);
  const hasChildren = group.children && group.children.length > 0;

  return (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {hasChildren && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                sx={{ color: BIM_COLORS.neutral.text.secondary }}
                title={open ? 'Contraer' : 'Expandir'}
              >
                {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onHighlight(group); }}
              sx={{ color: BIM_COLORS.primary.active }}
              title="Resaltar en 3D"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}
              sx={{ color: BIM_COLORS.status.error.main }}
              title="Eliminar"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <ListItemButton
          onClick={() => onViewDetail(group.id)}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            ml: depth * 2.5,
            border: '1px solid',
            borderColor: isActive ? BIM_COLORS.accent.main : BIM_COLORS.neutral.border,
            bgcolor: isActive ? BIM_COLORS.accent.soft : 'white',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: isActive ? BIM_COLORS.accent.main : BIM_COLORS.primary.main,
              bgcolor: isActive ? BIM_COLORS.accent.soft : 'rgba(0,0,0,0.02)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            },
          }}
        >
          <ListItemText
            slotProps={{
              primary: { component: 'span' },
              secondary: { component: 'div' },
            }}
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: BIM_COLORS.neutral.text.primary, flex: 1 }}>
                  {group.name}
                </Typography>
                {group.isCritical && (
                  <Tooltip title="Crítico">
                    <WarningIcon sx={{ fontSize: 14, color: BIM_COLORS.status.warning.main }} />
                  </Tooltip>
                )}
                <Chip
                  label={`${Number(group.progress).toFixed(1)}%`}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    bgcolor: color,
                    color: '#fff',
                    minWidth: 40,
                    height: 20,
                  }}
                />
              </Box>
            }
            secondary={
              <Box sx={{ mt: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={group.progress}
                  sx={{
                    height: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': { bgcolor: color },
                  }}
                />
                <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, mt: 0.3, display: 'block', fontSize: '0.6rem' }}>
                  {elementCount} elemento{elementCount !== 1 ? 's' : ''}
                  {hasChildren ? ` · ${group.children.length} subgrupo${group.children.length !== 1 ? 's' : ''}` : ''}
                  {group.weight ? ` · ${formatWeight(group.weight, group.weightUnit)}` : ''}
                </Typography>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {group.children.map((child) => (
            <GroupListItem
              key={child.id}
              group={child}
              elementCount={0}
              isActive={false}
              onHighlight={onHighlight}
              onViewDetail={onViewDetail}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </Collapse>
      )}
    </>
  );
};

const ProgressGroupList = ({ groups, elementCounts, activeGroupId, onHighlightGroup, onViewDetail, onAddGroup, onDeleteGroup }) => {
  const tree = useMemo(() => buildGroupTree(groups), [groups]);
  const [viewMode, setViewMode] = useState('tree');

  const visibleGroups = viewMode === 'tree' ? tree : groups;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: BIM_COLORS.neutral.text.primary }}>
          Grupos de Avance ({groups.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip
            label="Árbol"
            size="small"
            onClick={() => setViewMode('tree')}
            variant={viewMode === 'tree' ? 'filled' : 'outlined'}
            sx={{ height: 22, fontSize: '0.65rem' }}
          />
          <Chip
            label="Plano"
            size="small"
            onClick={() => setViewMode('flat')}
            variant={viewMode === 'flat' ? 'filled' : 'outlined'}
            sx={{ height: 22, fontSize: '0.65rem' }}
          />
          <IconButton size="small" onClick={onAddGroup} sx={{ color: BIM_COLORS.accent.main }} title="Nuevo Grupo">
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {groups.length === 0 ? (
        <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.disabled, textAlign: 'center', py: 3 }}>
          No hay grupos creados. Presiona + para crear uno.
        </Typography>
      ) : (
        <List dense disablePadding>
          {(viewMode === 'tree' ? tree : groups).map((item) =>
            viewMode === 'tree' ? (
              <GroupListItem
                key={item.id}
                group={item}
                elementCount={elementCounts[item.id] || 0}
                isActive={activeGroupId === item.id}
                onHighlight={onHighlightGroup}
                onViewDetail={onViewDetail}
                onDelete={onDeleteGroup}
              />
            ) : (
              <GroupListItem
                key={item.id}
                group={{ ...item, children: [] }}
                elementCount={elementCounts[item.id] || 0}
                isActive={activeGroupId === item.id}
                onHighlight={onHighlightGroup}
                onViewDetail={onViewDetail}
                onDelete={onDeleteGroup}
              />
            )
          )}
        </List>
      )}

      {activeGroupId && (
        <Typography variant="caption" sx={{ color: BIM_COLORS.accent.main, display: 'block', textAlign: 'center', mt: 1, fontWeight: 'medium' }}>
          Un grupo está activo. Los elementos 3D seleccionados se asignarán automáticamente.
        </Typography>
      )}
    </Box>
  );
};

export default ProgressGroupList;
