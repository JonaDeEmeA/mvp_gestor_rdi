import {
  Box, Typography, List, ListItem, ListItemButton,
  ListItemText, LinearProgress, IconButton, Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { getProgressColor } from '../../constants/progressStandards';
import { BIM_COLORS } from '../../constants/designTokens';

const GroupListItem = ({ group, elementCount, isActive, onHighlight, onViewDetail, onDelete }) => {
  const color = getProgressColor(group.progress);

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
          mb: 1.5,
          border: '1px solid',
          borderColor: isActive ? BIM_COLORS.accent.main : BIM_COLORS.neutral.border,
          bgcolor: isActive ? BIM_COLORS.accent.soft : 'white',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: isActive ? BIM_COLORS.accent.main : BIM_COLORS.primary.main,
            bgcolor: isActive ? BIM_COLORS.accent.soft : 'rgba(0,0,0,0.02)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transform: 'translateY(-2px)'
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
              <Chip
                label={`${group.progress}%`}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  bgcolor: color,
                  color: '#fff',
                  minWidth: 44,
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
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.08)',
                  '& .MuiLinearProgress-bar': { bgcolor: color },
                }}
              />
              <Typography variant="caption" sx={{ color: BIM_COLORS.neutral.text.secondary, mt: 0.5, display: 'block' }}>
                {elementCount} elemento{elementCount !== 1 ? 's' : ''}
                {isActive ? ' · Activo' : ''}
                {group.description ? ` · ${group.description}` : ''}
              </Typography>
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

const ProgressGroupList = ({ groups, elementCounts, activeGroupId, onHighlightGroup, onViewDetail, onAddGroup, onDeleteGroup }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: BIM_COLORS.neutral.text.primary }}>
          Grupos de Avance ({groups.length})
        </Typography>
        <IconButton size="small" onClick={onAddGroup} sx={{ color: BIM_COLORS.accent.main }} title="Nuevo Grupo">
          <AddIcon />
        </IconButton>
      </Box>

      {groups.length === 0 ? (
        <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.disabled, textAlign: 'center', py: 3 }}>
          No hay grupos creados. Presiona + para crear uno.
        </Typography>
      ) : (
        <List dense disablePadding>
          {groups.map((group) => (
            <GroupListItem
              key={group.id}
              group={group}
              elementCount={elementCounts[group.id] || 0}
              isActive={activeGroupId === group.id}
              onHighlight={onHighlightGroup}
              onViewDetail={onViewDetail}
              onDelete={onDeleteGroup}
            />
          ))}
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
