import {
  Box, Typography, LinearProgress, Chip, List, ListItem,
  ListItemText, Button, IconButton, Divider, Paper,
} from '@mui/material';
import { ArrowBack as BackIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getProgressColor } from '../../constants/progressStandards';
import { BIM_COLORS } from '../../constants/designTokens';

const ProgressGroupDetail = ({ group, elements, selectedGuid, onBack, onAssignElement, onRemoveElement }) => {
  const color = getProgressColor(group.progress);
  const alreadyAssigned = selectedGuid && elements.some((el) => el.ifcGuid === selectedGuid);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={onBack}>
          <BackIcon />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
          {group.name}
        </Typography>
        <Chip
          label={`${group.progress}%`}
          size="small"
          sx={{
            fontWeight: 'bold',
            bgcolor: color,
            color: '#fff',
          }}
        />
      </Box>

      {selectedGuid && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mb: 1.5,
            bgcolor: alreadyAssigned ? 'rgba(76, 175, 80, 0.06)' : 'rgba(33, 150, 243, 0.06)',
            borderColor: alreadyAssigned ? BIM_COLORS.accent.main : BIM_COLORS.primary.active,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            {alreadyAssigned ? '✓ Elemento ya asignado a este grupo:' : 'Elemento seleccionado en 3D:'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all', flex: 1 }}>
              {selectedGuid}
            </Typography>
            {!alreadyAssigned && (
              <Button
                size="small"
                variant="contained"
                onClick={() => onAssignElement(group.id, selectedGuid)}
                sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap', bgcolor: BIM_COLORS.accent.main, '&:hover': { bgcolor: BIM_COLORS.accent.active } }}
              >
                Asignar
              </Button>
            )}
          </Box>
        </Paper>
      )}

      <LinearProgress
        variant="determinate"
        value={group.progress}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 2,
          bgcolor: 'rgba(0,0,0,0.08)',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />

      {group.description && (
        <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.secondary, mb: 2 }}>
          {group.description}
        </Typography>
      )}

      <Divider sx={{ mb: 1.5 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Elementos ({elements.length})
        </Typography>
      </Box>

      {elements.length === 0 ? (
        <Typography variant="body2" sx={{ color: BIM_COLORS.neutral.text.disabled, textAlign: 'center', py: 2 }}>
          Este grupo no tiene elementos asignados. Selecciona un elemento 3D y presiona &quot;Asignar&quot; para agregarlo.
        </Typography>
      ) : (
        <List dense disablePadding>
          {elements.map((el) => (
            <ListItem
              key={el.id}
              sx={{ borderRadius: 1, mb: 0.3 }}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => onRemoveElement(group.id, el.ifcGuid)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  el.elementType
                    ? <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.78rem' }}>
                        {el.elementType}
                      </Typography>
                    : null
                }
                secondary={
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'text.secondary' }}>
                    {el.ifcGuid}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ProgressGroupDetail;
